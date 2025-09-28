import { useState, useEffect } from "react";
import { useAuth } from '@/components/auth/AuthContext';
import { useDevMode } from '@/contexts/DevModeContext';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  MapPin, Phone, Mail, Package, Tag, Camera, Wrench, Calendar, 
  DollarSign, Search, Filter, Eye, ExternalLink 
} from "lucide-react";
import { format } from "date-fns";

interface Lead {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  postal_code: string;
  street_address: string | null;
  address_city: string | null;
  address_province: string | null;
  address_formatted: string | null;
  flooring_type: string | null;
  square_footage: number | null;
  brand_requested: string | null;
  installation_required: boolean | null;
  notes: string | null;
  attachment_urls: string[] | null;
  created_at: string;
  budget_range: string | null;
}

interface LeadDistribution {
  id: string;
  lead_price: number;
  sent_at: string;
  status: string;
  brand_matched: string | null;
  was_paid: boolean;
  leads: Lead;
}

const RetailerLeadsList = () => {
  const { user } = useAuth();
  const { isDevMode, mockLeads } = useDevMode();
  const [leadDistributions, setLeadDistributions] = useState<LeadDistribution[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<LeadDistribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<LeadDistribution | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchLeadDistributions();
  }, []);

  useEffect(() => {
    filterLeads();
  }, [leadDistributions, searchTerm, statusFilter, typeFilter]);

  const fetchLeadDistributions = async () => {
    try {
      setLoading(true);
      
      if (isDevMode && mockLeads) {
        const mockDistributions = mockLeads.map((lead, index) => ({
          id: `dist-${lead.id}`,
          lead_price: lead.lead_price,
          sent_at: lead.created_at,
          status: lead.distribution_status,
          brand_matched: lead.brand_matched,
          was_paid: index === 0,
          leads: lead
        }));
        setLeadDistributions(mockDistributions);
        return;
      }

      const { data, error } = await supabase
        .from('lead_distributions')
        .select(`
          id,
          lead_price,
          sent_at,
          status,
          brand_matched,
          was_paid,
          leads (
            id,
            customer_name,
            customer_email,
            customer_phone,
            postal_code,
            street_address,
            address_city,
            address_province,
            address_formatted,
            flooring_type,
            square_footage,
            brand_requested,
            installation_required,
            notes,
            attachment_urls,
            created_at,
            budget_range
          )
        `)
        .order('sent_at', { ascending: false });

      if (error) throw error;
      setLeadDistributions(data || []);
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast({
        title: "Error",
        description: "Failed to fetch leads. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterLeads = () => {
    let filtered = leadDistributions;

    if (searchTerm) {
      filtered = filtered.filter(dist => 
        dist.leads.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dist.leads.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dist.leads.postal_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (dist.leads.address_city && dist.leads.address_city.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(dist => dist.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(dist => dist.leads.flooring_type === typeFilter);
    }

    setFilteredLeads(filtered);
  };

  const getSquareFootageTier = (sqft: number | null): string => {
    if (!sqft) return 'Unknown';
    if (sqft <= 100) return '0-100 sq ft';
    if (sqft <= 500) return '100-500 sq ft';
    if (sqft <= 1000) return '500-1000 sq ft';
    if (sqft <= 5000) return '1000-5000 sq ft';
    return '5000+ sq ft';
  };

  const formatFlooringType = (type: string | null): string => {
    if (!type) return 'Not specified';
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const getProjectValue = (lead: Lead): string => {
    if (lead.budget_range) return lead.budget_range;
    if (lead.square_footage) {
      const sqft = lead.square_footage;
      if (sqft <= 100) return '$500-2,000';
      if (sqft <= 500) return '$2,000-10,000';
      if (sqft <= 1000) return '$5,000-20,000';
      if (sqft <= 5000) return '$15,000-100,000';
      return '$50,000+';
    }
    return 'Unknown';
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">Your Leads</h1>
          <p className="text-gray-600">
            {filteredLeads.length} leads found
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, email, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="viewed">Viewed</SelectItem>
                <SelectItem value="responded">Responded</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by flooring type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="hardwood">Hardwood</SelectItem>
                <SelectItem value="vinyl">Vinyl</SelectItem>
                <SelectItem value="carpet">Carpet</SelectItem>
                <SelectItem value="tile">Tile</SelectItem>
                <SelectItem value="laminate">Laminate</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setTypeFilter('all');
            }}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Leads List */}
      {filteredLeads.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No leads found</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' 
                ? "Try adjusting your filters to see more leads."
                : "New leads will appear here when customers request quotes matching your criteria."
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredLeads.map((distribution) => {
            const lead = distribution.leads;
            return (
              <Card key={distribution.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{lead.customer_name}</h3>
                        <Badge variant={distribution.was_paid ? "default" : "outline"}>
                          {distribution.was_paid ? "Paid" : "Pending"}
                        </Badge>
                        <Badge variant="secondary" className="capitalize">
                          {distribution.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {lead.address_city || lead.postal_code}
                        </div>
                        <div className="flex items-center gap-1">
                          <Tag className="w-4 h-4" />
                          {formatFlooringType(lead.flooring_type)}
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          {getProjectValue(lead)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(distribution.sent_at), 'MMM dd')}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedLead(distribution)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => window.open(`mailto:${lead.customer_email}?subject=Quote for your flooring project`, '_blank')}
                      >
                        <Mail className="w-4 h-4 mr-1" />
                        Quote
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Lead Detail Modal */}
      <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedLead && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedLead.leads.customer_name}
                  <Badge variant={selectedLead.was_paid ? "default" : "outline"}>
                    {selectedLead.was_paid ? "Paid" : "Pending"}
                  </Badge>
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Contact & Location */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Contact Information
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3 h-3 text-gray-400" />
                        <a href={`mailto:${selectedLead.leads.customer_email}`} className="text-blue-600 hover:underline">
                          {selectedLead.leads.customer_email}
                        </a>
                      </div>
                      {selectedLead.leads.customer_phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-3 h-3 text-gray-400" />
                          <a href={`tel:${selectedLead.leads.customer_phone}`} className="text-blue-600 hover:underline">
                            {selectedLead.leads.customer_phone}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Location
                    </h4>
                    <div className="text-sm">
                      {selectedLead.leads.address_formatted ? (
                        <p>{selectedLead.leads.address_formatted}</p>
                      ) : (
                        <div>
                          {selectedLead.leads.street_address && <p>{selectedLead.leads.street_address}</p>}
                          <p>
                            {selectedLead.leads.address_city && `${selectedLead.leads.address_city}, `}
                            {selectedLead.leads.address_province} {selectedLead.leads.postal_code}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Project Details */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Project Details
                  </h4>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Flooring Type:</span>
                      <p>{formatFlooringType(selectedLead.leads.flooring_type)}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Brand:</span>
                      <p>{selectedLead.leads.brand_requested || selectedLead.brand_matched || 'Any brand'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Size:</span>
                      <p>{getSquareFootageTier(selectedLead.leads.square_footage)}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Installation:</span>
                      <p className="flex items-center gap-1">
                        {selectedLead.leads.installation_required ? (
                          <>
                            <Wrench className="w-3 h-3 text-green-500" />
                            Required
                          </>
                        ) : (
                          'Not required'
                        )}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Budget:</span>
                      <p>{getProjectValue(selectedLead.leads)}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Lead Price:</span>
                      <p>${selectedLead.lead_price.toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Date:</span>
                      <p>{format(new Date(selectedLead.sent_at), 'MMM dd, yyyy')}</p>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {selectedLead.leads.notes && (
                  <div>
                    <h4 className="font-semibold mb-2">Customer Notes:</h4>
                    <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded-lg">
                      {selectedLead.leads.notes}
                    </p>
                  </div>
                )}

                {/* Attachments */}
                {selectedLead.leads.attachment_urls && selectedLead.leads.attachment_urls.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Camera className="w-4 h-4" />
                      Customer Photos ({selectedLead.leads.attachment_urls.length})
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {selectedLead.leads.attachment_urls.map((url, index) => (
                        <a
                          key={index}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block"
                        >
                          <img
                            src={url}
                            alt={`Customer photo ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg hover:opacity-80 transition-opacity cursor-pointer"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    onClick={() => window.open(`mailto:${selectedLead.leads.customer_email}?subject=Quote for your flooring project`, '_blank')}
                    className="flex items-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    Send Quote
                  </Button>
                  {selectedLead.leads.customer_phone && (
                    <Button
                      variant="outline"
                      onClick={() => window.open(`tel:${selectedLead.leads.customer_phone}`, '_self')}
                      className="flex items-center gap-2"
                    >
                      <Phone className="w-4 h-4" />
                      Call Customer
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => {
                      const address = selectedLead.leads.address_formatted || 
                        `${selectedLead.leads.street_address || ''} ${selectedLead.leads.address_city || ''} ${selectedLead.leads.address_province || ''} ${selectedLead.leads.postal_code}`;
                      window.open(`https://maps.google.com?q=${encodeURIComponent(address)}`, '_blank');
                    }}
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View on Map
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RetailerLeadsList;