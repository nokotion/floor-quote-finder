
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import PostalCodeCoverage from '@/components/retailer/PostalCodeCoverage';
import RetailerSubscriptionCard from '@/components/retailer/RetailerSubscriptionCard';
import { useDebounce } from '@/hooks/useDebounce';
import { SQFT_TIERS } from '@/constants/flooringData';
import { useAuth } from '@/components/auth/AuthContext';

interface FlooringBrand {
  id: string;
  name: string;
  categories: string;
  logo_url?: string;
  featured: boolean;
}

interface BrandSubscription {
  id: string;
  brand_name: string;
  is_active: boolean;
  sqft_tier: '0-100' | '100-500' | '500-1000' | '1000-5000' | '5000+';
  lead_price: number;
  accepts_installation: boolean;
  installation_surcharge: number;
}

// Custom hook for debounced auto-save
const useAutoSave = (callback: (...args: any[]) => Promise<void>, delay: number = 500) => {
  const debouncedCallback = useDebounce(callback, delay);
  return debouncedCallback;
};

const RetailerSubscriptions = () => {
  const [brands, setBrands] = useState<FlooringBrand[]>([]);
  const [subscriptions, setSubscriptions] = useState<BrandSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [retailerId, setRetailerId] = useState<string>('');
  const [savingStates, setSavingStates] = useState<{[key: string]: boolean}>({});
  
  const { user, profile } = useAuth();

  useEffect(() => {
    console.log('RetailerSubscriptions mounted with user:', user?.id, 'profile:', profile);
    if (user && profile) {
      fetchData();
    }
  }, [user, profile]);

  const fetchData = async () => {
    try {
      console.log('Fetching data for retailer:', profile?.retailer_id);
      
      if (!profile?.retailer_id) {
        console.error('No retailer_id found in profile');
        setLoading(false);
        return;
      }

      setRetailerId(profile.retailer_id);

      // Fetch available brands
      const { data: brandsData, error: brandsError } = await supabase
        .from('flooring_brands')
        .select('*')
        .order('featured', { ascending: false })
        .order('name');

      if (brandsError) {
        console.error('Error fetching brands:', brandsError);
        throw brandsError;
      }

      // Fetch current subscriptions
      const { data: subscriptionsData, error: subscriptionsError } = await supabase
        .from('brand_subscriptions')
        .select('*')
        .eq('retailer_id', profile.retailer_id);

      if (subscriptionsError) {
        console.error('Error fetching subscriptions:', subscriptionsError);
        throw subscriptionsError;
      }

      console.log('Fetched brands:', brandsData?.length, 'subscriptions:', subscriptionsData?.length);
      
      setBrands(brandsData || []);
      setSubscriptions(subscriptionsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load subscription data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const setSavingState = (key: string, saving: boolean) => {
    setSavingStates(prev => ({ ...prev, [key]: saving }));
  };

  const autoSaveSubscription = useCallback(async (subscriptionId: string, updates: Partial<BrandSubscription>): Promise<void> => {
    setSavingState(subscriptionId, true);
    try {
      const { error } = await supabase
        .from('brand_subscriptions')
        .update(updates)
        .eq('id', subscriptionId);

      if (error) throw error;

      toast({
        title: "Saved",
        description: "Subscription settings updated successfully.",
      });
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast({
        title: "Error",
        description: "Failed to update subscription settings.",
        variant: "destructive",
      });
    } finally {
      setSavingState(subscriptionId, false);
    }
  }, []);

  const debouncedAutoSave = useAutoSave(autoSaveSubscription);

  const handleToggleTier = async (brandName: string, tier: string, isActive: boolean) => {
    const tierKey = `${brandName}-${tier}`;
    setSavingState(tierKey, true);

    try {
      if (!profile?.retailer_id) {
        throw new Error('No retailer ID found');
      }

      const existingSubscription = subscriptions.find(s => 
        s.brand_name === brandName && s.sqft_tier === tier
      );

      if (existingSubscription) {
        // Optimistic update
        setSubscriptions(prev => 
          prev.map(sub => 
            sub.id === existingSubscription.id 
              ? { ...sub, is_active: isActive } 
              : sub
          )
        );

        // Update existing subscription
        const { error } = await supabase
          .from('brand_subscriptions')
          .update({ is_active: isActive })
          .eq('id', existingSubscription.id);

        if (error) {
          // Revert optimistic update on error
          setSubscriptions(prev => 
            prev.map(sub => 
              sub.id === existingSubscription.id 
                ? { ...sub, is_active: !isActive } 
                : sub
            )
          );
          throw error;
        }
      } else if (isActive) {
        // Create new subscription with calculated lead_price
        const tierInfo = SQFT_TIERS.find(t => t.value === tier);
        const newSubscription = {
          retailer_id: profile.retailer_id,
          brand_name: brandName,
          sqft_tier: tier as '0-100' | '100-500' | '500-1000' | '1000-5000' | '5000+',
          is_active: true,
          lead_price: tierInfo?.basePrice || 0,
          accepts_installation: false,
          installation_surcharge: 0.50
        };

        const { data, error } = await supabase
          .from('brand_subscriptions')
          .insert(newSubscription)
          .select()
          .single();

        if (error) throw error;

        if (data) {
          setSubscriptions(prev => [...prev, data]);
        }
      }

      toast({
        title: isActive ? "Subscription Activated" : "Subscription Deactivated",
        description: `${brandName} - ${tier} subscription has been ${isActive ? 'activated' : 'deactivated'}.`,
      });
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast({
        title: "Error",
        description: "Failed to update subscription.",
        variant: "destructive",
      });
    } finally {
      setSavingState(tierKey, false);
    }
  };

  const handleToggleInstall = async (brandName: string, tier: string, acceptsInstall: boolean) => {
    try {
      const existingSubscription = subscriptions.find(s => 
        s.brand_name === brandName && s.sqft_tier === tier && s.is_active
      );

      if (existingSubscription) {
        // Optimistic update
        setSubscriptions(prev => 
          prev.map(sub => 
            sub.id === existingSubscription.id 
              ? { ...sub, accepts_installation: acceptsInstall } 
              : sub
          )
        );

        // Trigger debounced auto-save
        debouncedAutoSave(existingSubscription.id, { accepts_installation: acceptsInstall });
      }
    } catch (error) {
      console.error('Error updating installation preference:', error);
      toast({
        title: "Error",
        description: "Failed to update installation preference.",
        variant: "destructive",
      });
    }
  };

  const getSubscriptionsForBrand = (brandName: string) => {
    return subscriptions.filter(s => s.brand_name === brandName);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Brand Subscriptions</h1>
        <Badge variant="outline">
          {subscriptions.filter(s => s.is_active).length} active subscriptions
        </Badge>
      </div>

      {/* Postal Code Coverage Section */}
      <PostalCodeCoverage retailerId={retailerId} />

      {/* Compact Brand Subscriptions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {brands.map((brand) => {
          const brandSubscriptions = getSubscriptionsForBrand(brand.name);

          return (
            <RetailerSubscriptionCard
              key={brand.id}
              brand={brand}
              subscriptions={brandSubscriptions}
              onToggleTier={handleToggleTier}
              onToggleInstall={handleToggleInstall}
              savingStates={savingStates}
            />
          );
        })}
      </div>

      {brands.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No brands available</h3>
            <p className="text-gray-500">
              Check back later for available brand subscriptions.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RetailerSubscriptions;
