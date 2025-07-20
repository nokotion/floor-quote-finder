
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Package } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import PostalCodeCoverage from '@/components/retailer/PostalCodeCoverage';
import { useDebounce } from '@/hooks/useDebounce';

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
  min_square_footage: number;
  max_square_footage: number;
  lead_price: number;
}

// Custom hook for debounced auto-save
const useAutoSave = (callback: Function, delay: number = 500) => {
  const debouncedCallback = useDebounce(callback, delay);
  return debouncedCallback;
};

const RetailerSubscriptions = () => {
  const [brands, setBrands] = useState<FlooringBrand[]>([]);
  const [subscriptions, setSubscriptions] = useState<BrandSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [retailerId, setRetailerId] = useState<string>('');
  const [savingStates, setSavingStates] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get retailer profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('retailer_id')
        .eq('id', user.id)
        .single();

      if (!profile?.retailer_id) return;

      setRetailerId(profile.retailer_id);

      // Fetch available brands
      const { data: brandsData } = await supabase
        .from('flooring_brands')
        .select('*')
        .order('featured', { ascending: false })
        .order('name');

      // Fetch current subscriptions
      const { data: subscriptionsData } = await supabase
        .from('brand_subscriptions')
        .select('*')
        .eq('retailer_id', profile.retailer_id);

      setBrands(brandsData || []);
      setSubscriptions(subscriptionsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const setSavingState = (subscriptionId: string, saving: boolean) => {
    setSavingStates(prev => ({ ...prev, [subscriptionId]: saving }));
  };

  const autoSaveSubscription = useCallback(async (subscriptionId: string, updates: Partial<BrandSubscription>) => {
    setSavingState(subscriptionId, true);
    try {
      await supabase
        .from('brand_subscriptions')
        .update(updates)
        .eq('id', subscriptionId);

      // Update local state
      setSubscriptions(prev => 
        prev.map(sub => 
          sub.id === subscriptionId ? { ...sub, ...updates } : sub
        )
      );

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

  const toggleBrandSubscription = async (brandName: string, isActive: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('retailer_id')
        .eq('id', user.id)
        .single();

      if (!profile?.retailer_id) return;

      const existingSubscription = subscriptions.find(s => s.brand_name === brandName);

      if (existingSubscription) {
        // Validate before toggling ON
        if (isActive) {
          const isValid = validateSubscription(existingSubscription);
          if (!isValid) {
            toast({
              title: "Validation Error",
              description: "Please set valid square footage and lead price before activating.",
              variant: "destructive",
            });
            return;
          }
        }

        // Update existing subscription
        await supabase
          .from('brand_subscriptions')
          .update({ is_active: isActive })
          .eq('id', existingSubscription.id);

        // Update local state
        setSubscriptions(prev => 
          prev.map(sub => 
            sub.id === existingSubscription.id ? { ...sub, is_active: isActive } : sub
          )
        );
      } else {
        // Create new subscription with default values
        const newSubscription = {
          retailer_id: profile.retailer_id,
          brand_name: brandName,
          is_active: isActive,
          min_square_footage: 0,
          max_square_footage: 999999,
          lead_price: 5.00
        };

        const { data } = await supabase
          .from('brand_subscriptions')
          .insert(newSubscription)
          .select()
          .single();

        if (data) {
          setSubscriptions(prev => [...prev, data]);
        }
      }

      toast({
        title: isActive ? "Subscription Activated" : "Subscription Deactivated",
        description: `${brandName} subscription has been ${isActive ? 'activated' : 'deactivated'}.`,
      });
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast({
        title: "Error",
        description: "Failed to update subscription.",
        variant: "destructive",
      });
    }
  };

  const validateSubscription = (subscription: BrandSubscription): boolean => {
    return subscription.min_square_footage >= 0 && 
           subscription.max_square_footage > subscription.min_square_footage &&
           subscription.lead_price > 0;
  };

  const handleSubscriptionChange = (subscriptionId: string, field: keyof BrandSubscription, value: any) => {
    // Update local state immediately for responsive UI
    setSubscriptions(prev => 
      prev.map(sub => 
        sub.id === subscriptionId ? { ...sub, [field]: value } : sub
      )
    );

    // Trigger debounced auto-save
    debouncedAutoSave(subscriptionId, { [field]: value });
  };

  const getSubscriptionForBrand = (brandName: string) => {
    return subscriptions.find(s => s.brand_name === brandName);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                </div>
              </CardContent>
            </Card>
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

      {/* Brand Subscriptions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {brands.map((brand) => {
          const subscription = getSubscriptionForBrand(brand.name);
          const isSubscribed = subscription?.is_active || false;
          const isSaving = subscription ? savingStates[subscription.id] : false;

          return (
            <Card key={brand.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center">
                    {brand.logo_url && (
                      <img 
                        src={brand.logo_url} 
                        alt={brand.name}
                        className="w-8 h-8 mr-2 rounded"
                      />
                    )}
                    {brand.name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {brand.featured && (
                      <Badge variant="secondary">Featured</Badge>
                    )}
                    {isSaving && (
                      <Badge variant="outline" className="text-xs">
                        Saving...
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {brand.categories}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor={`subscription-${brand.id}`}>
                    Subscribe to leads
                  </Label>
                  <Switch
                    id={`subscription-${brand.id}`}
                    checked={isSubscribed}
                    onCheckedChange={(checked) => toggleBrandSubscription(brand.name, checked)}
                  />
                </div>

                {subscription && isSubscribed && (
                  <div className="space-y-3 pt-3 border-t">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Min Sq Ft</Label>
                        <Input
                          type="number"
                          value={subscription.min_square_footage}
                          onChange={(e) => handleSubscriptionChange(
                            subscription.id, 
                            'min_square_footage', 
                            parseInt(e.target.value) || 0
                          )}
                          className="h-8"
                          min="0"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Max Sq Ft</Label>
                        <Input
                          type="number"
                          value={subscription.max_square_footage}
                          onChange={(e) => handleSubscriptionChange(
                            subscription.id, 
                            'max_square_footage', 
                            parseInt(e.target.value) || 999999
                          )}
                          className="h-8"
                          min="1"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Lead Price ($CAD)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={subscription.lead_price}
                        onChange={(e) => handleSubscriptionChange(
                          subscription.id, 
                          'lead_price', 
                          parseFloat(e.target.value) || 0
                        )}
                        className="h-8"
                        min="0.01"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
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
