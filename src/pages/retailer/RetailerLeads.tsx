import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, Lock, Unlock, MapPin, Calendar, DollarSign, Users } from 'lucide-react';

interface Lead {
  id: string;
  customer_name: string;
  customer_email: string;
  postal_code: string;
  square_footage: number;
  brand_requested: string;
  budget_range: string;
  created_at: string;
  is_locked: boolean;
  lock_price: number;
  status: string;
}

const RetailerLeads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    brand: '',
    postal: '',
    minSqft: '',
    maxSqft: ''
  });

  useEffect(() => {
    fetchLeads();
  }, [filters]);

  const fetchLeads = async () => {
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

      // Build query
      let query = supabase
        .from('leads')
        .select(`
          id,
          customer_name,
          customer_email,
          postal_code,
          square_footage,
          brand_requested,
          budget_range,
          created_at,
          is_locked,
          lock_price,
          status,
          lead_distributions!inner(retailer_id)
        `)
        .eq('lead_distributions.retailer_id', profile.retailer_id);

      // Apply filters
      if (filters.brand) {
        query = query.ilike('brand_requested', `%${filters.brand}%`);
      }
      if (filters.postal) {
        query = query.ilike('postal_code', `${filters.postal}%`);
      }
      if (filters.minSqft) {
        query = query.gte('square_footage', parseInt(filters.minSqft));
      }
      if (filters.maxSqft) {
        query = query.lte('square_footage', parseInt(filters.maxSqft));
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyLead = async (leadId: string, price: number) => {
    // This will integrate with Stripe payment processing
    console.log('Buying lead:', leadId, 'for price:', price);
    // TODO: Implement Stripe payment flow
  };

  const getStatusBadge = (lead: Lead) => {
    if (lead.is_locked) {
      return <Badge variant="destructive"><Lock className="w-3 h-3 mr-1" />Locked</Badge>;
    }
    return <Badge variant="default"><Unlock className="w-3 h-3 mr-1" />Available</Badge>;
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
        <h1 className="text-2xl font-bold text-gray-900">My Leads</h1>
        <Badge variant="outline">{leads.length} leads</Badge>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Brand</label>
              <Input
                placeholder="Filter by brand"
                value={filters.brand}
                onChange={(e) => setFilters(prev => ({ ...prev, brand: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Postal Code</label>
              <Input
                placeholder="e.g., M5V"
                value={filters.postal}
                onChange={(e) => setFilters(prev => ({ ...prev, postal: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Min Sq Ft</label>
              <Input
                type="number"
                placeholder="0"
                value={filters.minSqft}
                onChange={(e) => setFilters(prev => ({ ...prev, minSqft: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Max Sq Ft</label>
              <Input
                type="number"
                placeholder="10000"
                value={filters.maxSqft}
                onChange={(e) => setFilters(prev => ({ ...prev, maxSqft: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leads Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {leads.map((lead) => (
          <Card key={lead.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{lead.customer_name}</CardTitle>
                {getStatusBadge(lead)}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="w-4 h-4 mr-1" />
                {new Date(lead.created_at).toLocaleDateString()}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center text-sm">
                <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                <span>{lead.postal_code}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Square Footage:</span>
                  <div className="font-medium">{lead.square_footage?.toLocaleString()} sq ft</div>
                </div>
                <div>
                  <span className="text-gray-500">Budget:</span>
                  <div className="font-medium">{lead.budget_range}</div>
                </div>
              </div>

              {lead.brand_requested && (
                <div>
                  <span className="text-gray-500 text-sm">Requested Brand:</span>
                  <div className="font-medium">{lead.brand_requested}</div>
                </div>
              )}

              <div className="pt-3 border-t">
                {lead.is_locked ? (
                  <Button 
                    onClick={() => handleBuyLead(lead.id, lead.lock_price)}
                    className="w-full"
                    variant="outline"
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    Buy Lead - ${lead.lock_price}
                  </Button>
                ) : (
                  <Button className="w-full">
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {leads.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No leads found</h3>
            <p className="text-gray-500">
              Try adjusting your filters or check back later for new leads.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RetailerLeads;
