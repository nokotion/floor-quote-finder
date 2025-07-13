import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, Lock, Unlock, MapPin, Calendar, DollarSign, Users, Image, Phone, Mail, Home, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Lead {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  postal_code: string;
  street_address: string;
  square_footage: number;
  brand_requested: string;
  budget_range: string;
  created_at: string;
  is_locked: boolean;
  lock_price: number;
  status: string;
  attachment_urls: string[];
  installation_required: boolean;
  timeline: string;
  notes: string;
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
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

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
          customer_phone,
          postal_code,
          street_address,
          square_footage,
          brand_requested,
          budget_range,
          created_at,
          is_locked,
          lock_price,
          status,
          attachment_urls,
          installation_required,
          timeline,
          notes,
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

              {lead.attachment_urls && lead.attachment_urls.length > 0 && (
                <div className="flex items-center text-sm text-blue-600">
                  <Image className="w-4 h-4 mr-1" />
                  <span>{lead.attachment_urls.length} photo{lead.attachment_urls.length > 1 ? 's' : ''}</span>
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
                  <Button 
                    onClick={() => setSelectedLead(lead)}
                    className="w-full"
                  >
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

      {/* Lead Details Modal */}
      <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Lead Details - {selectedLead?.customer_name}</span>
              <Button variant="ghost" size="sm" onClick={() => setSelectedLead(null)}>
                <X className="w-4 h-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          {selectedLead && (
            <div className="space-y-6">
              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{selectedLead.customer_email}</span>
                    </div>
                    {selectedLead.customer_phone && (
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{selectedLead.customer_phone}</span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{selectedLead.postal_code}</span>
                    </div>
                    {selectedLead.street_address && (
                      <div className="flex items-center">
                        <Home className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{selectedLead.street_address}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Project Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Project Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-500 text-sm">Square Footage:</span>
                      <div className="font-medium">{selectedLead.square_footage?.toLocaleString()} sq ft</div>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Brand Requested:</span>
                      <div className="font-medium">{selectedLead.brand_requested || 'Any brand'}</div>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Installation Required:</span>
                      <div className="font-medium">{selectedLead.installation_required ? 'Yes' : 'No'}</div>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Timeline:</span>
                      <div className="font-medium">{selectedLead.timeline || 'Not specified'}</div>
                    </div>
                  </div>
                  {selectedLead.notes && (
                    <div>
                      <span className="text-gray-500 text-sm">Additional Notes:</span>
                      <div className="font-medium mt-1">{selectedLead.notes}</div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Customer Photos */}
              {selectedLead.attachment_urls && selectedLead.attachment_urls.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Image className="w-5 h-5 mr-2" />
                      Customer Photos ({selectedLead.attachment_urls.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {selectedLead.attachment_urls.map((url, index) => (
                        <div key={index} className="group">
                          <a href={url} target="_blank" rel="noopener noreferrer">
                            <img
                              src={url}
                              alt={`Customer photo ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg border-2 border-gray-200 hover:border-blue-500 transition-colors cursor-pointer"
                            />
                          </a>
                          <p className="text-xs text-gray-500 text-center mt-1">Photo {index + 1}</p>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-gray-500 mt-4 italic">Click on any photo to view full size</p>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                {selectedLead.is_locked ? (
                  <Button 
                    onClick={() => handleBuyLead(selectedLead.id, selectedLead.lock_price)}
                    className="flex-1"
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    Buy Lead - ${selectedLead.lock_price}
                  </Button>
                ) : (
                  <Button className="flex-1" disabled>
                    Lead Available
                  </Button>
                )}
                <Button variant="outline" onClick={() => setSelectedLead(null)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RetailerLeads;
