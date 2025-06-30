
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Package, Plus, Settings } from 'lucide-react';

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

const RetailerSubscriptions = () => {
  const [brands, setBrands] = useState<FlooringBrand[]>([]);
  const [subscriptions, setSubscriptions] = useState<BrandSubscription[]>([]);
  const [loading, setLoading] = useState(true);

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
        // Update existing subscription
        await supabase
          .from('brand_subscriptions')
          .update({ is_active: isActive })
          .eq('id', existingSubscription.id);
      } else {
        // Create new subscription
        await supabase
          .from('brand_subscriptions')
          .insert({
            retailer_id: profile.retailer_id,
            brand_name: brandName,
            is_active: isActive,
            min_square_footage: 0,
            max_square_footage: 999999,
            lead_price: 0
          });
      }

      // Refresh data
      fetchData();
    } catch (error) {
      console.error('Error updating subscription:', error);
    }
  };

  const updateSubscriptionSettings = async (subscriptionId: string, settings: Partial<BrandSubscription>) => {
    try {
      await supabase
        .from('brand_subscriptions')
        .update(settings)
        .eq('id', subscriptionId);

      fetchData();
    } catch (error) {
      console.error('Error updating subscription settings:', error);
    }
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {brands.map((brand) => {
          const subscription = getSubscriptionForBrand(brand.name);
          const isSubscribed = subscription?.is_active || false;

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
                  {brand.featured && (
                    <Badge variant="secondary">Featured</Badge>
                  )}
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
                          onChange={(e) => updateSubscriptionSettings(subscription.id, {
                            min_square_footage: parseInt(e.target.value) || 0
                          })}
                          className="h-8"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Max Sq Ft</Label>
                        <Input
                          type="number"
                          value={subscription.max_square_footage}
                          onChange={(e) => updateSubscriptionSettings(subscription.id, {
                            max_square_footage: parseInt(e.target.value) || 999999
                          })}
                          className="h-8"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Lead Price ($CAD)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={subscription.lead_price}
                        onChange={(e) => updateSubscriptionSettings(subscription.id, {
                          lead_price: parseFloat(e.target.value) || 0
                        })}
                        className="h-8"
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
