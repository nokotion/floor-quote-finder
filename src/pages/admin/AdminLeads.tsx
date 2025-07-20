
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Search, Filter, Eye, MapPin, Package, Tag, Wrench, Camera, Calendar, DollarSign } from "lucide-react";
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
  timeline: string | null;
  status: string;
  is_verified: boolean;
  created_at: string;
  assigned_retailer_id: string | null;
  retailers?: {
    business_name: string;
  } | null;
}

interface LeadDistribution {
  id: string;
  lead_price: number;
  sent_at: string;
  status: string;
  brand_matched: string | null;
  was_paid: boolean;
  retailers: {
    business_name: string;
  };
}

const AdminLeads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadDistributions, setLeadDistributions] = useState<Record<string, LeadDistribution[]>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedLead, setExpandedLead] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select(`
          *,
          retailers:assigned_retailer_id (
            business_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeads(data || []);

      // Fetch distributions for each lead
      const leadIds = data?.map(lead => lead.id) || [];
      if (leadIds.length > 0) {
        const { data: distributions, error: distError } = await supabase
          .from('lead_distributions')
          .select(`
            id,
            lead_id,
            lead_price,
            sent_at,
            status,
            brand_matched,
            was_paid,
            retailers (
              business_name
            )
          `)
          .in('lead_id', leadIds);

        if (distError) throw distError;

        // Group distributions by lead_id
        const groupedDistributions: Record<string, LeadDistribution[]> = {};
        distributions?.forEach(dist => {
          if (!groupedDistributions[dist.lead_id]) {
            groupedDistributions[dist.lead_id] = [];
          }
          groupedDistributions[dist.lead_id].push(dist);
        });
        setLeadDistributions(groupedDistributions);
      }
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

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.postal_code.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const toggleLeadExpansion = (leadId: string) => {
    setExpandedLead(expandedLead === leadId ? null : leadId);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Lead Management</h1>
        
        {/* Filters */}
        <div className="flex gap-4 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by name, email, or postal code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending_verification">Pending Verification</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="distributed">Distributed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Leads List */}
      <div className="space-y-4">
        {filteredLeads.map((lead) => {
          const distributions = leadDistributions[lead.id] || [];
          const isExpanded = expandedLead === lead.id;
          
          return (
            <Card key={lead.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-xl">{lead.customer_name}</CardTitle>
                      <Badge 
                        variant={lead.is_verified ? "default" : "secondary"}
                        className={lead.is_verified ? "bg-green-100 text-green-800" : ""}
                      >
                        {lead.is_verified ? 'Verified' : 'Pending Verification'}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {lead.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(lead.created_at), 'MMM dd, yyyy HH:mm')}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {lead.postal_code}
                      </div>
                      {distributions.length > 0 && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          {distributions.length} retailer{distributions.length > 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleLeadExpansion(lead.id)}
                    className="flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    {isExpanded ? 'Hide Details' : 'View Details'}
                  </Button>
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="space-y-6">
                  {/* Contact Information */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Contact Information</h4>
                      <div className="space-y-2 text-sm">
                        <div><strong>Email:</strong> {lead.customer_email}</div>
                        {lead.customer_phone && <div><strong>Phone:</strong> {lead.customer_phone}</div>}
                        <div><strong>Address:</strong></div>
                        <div className="ml-4 text-gray-600">
                          {lead.address_formatted || (
                            <>
                              {lead.street_address && <div>{lead.street_address}</div>}
                              <div>
                                {lead.address_city && `${lead.address_city}, `}
                                {lead.address_province } {lead.postal_code}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Project Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4 text-orange-500" />
                          <strong>Flooring Type:</strong> {formatFlooringType(lead.flooring_type)}
                        </div>
                        {lead.brand_requested && (
                          <div><strong>Brand:</strong> {lead.brand_requested}</div>
                        )}
                        {lead.square_footage && (
                          <div><strong>Size:</strong> {getSquareFootageTier(lead.square_footage)}</div>
                        )}
                        <div className="flex items-center gap-2">
                          {lead.installation_required ? (
                            <>
                              <Wrench className="w-4 h-4 text-green-500" />
                              <strong>Installation:</strong> Required
                            </>
                          ) : (
                            <>
                              <span className="w-4 h-4 inline-block" />
                              <strong>Installation:</strong> Not required
                            </>
                          )}
                        </div>
                        {lead.timeline && (
                          <div><strong>Timeline:</strong> {lead.timeline}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {lead.notes && (
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Customer Notes</h4>
                      <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded-lg">
                        {lead.notes}
                      </p>
                    </div>
                  )}

                  {/* Attachments */}
                  {lead.attachment_urls && lead.attachment_urls.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <Camera className="w-4 h-4" />
                        Customer Photos ({lead.attachment_urls.length})
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {lead.attachment_urls.map((url, index) => (
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

                  {/* Lead Distributions */}
                  {distributions.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">
                        Retailer Distributions ({distributions.length})
                      </h4>
                      <div className="space-y-2">
                        {distributions.map((dist) => (
                          <div key={dist.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg text-sm">
                            <div className="flex items-center gap-3">
                              <span className="font-medium">{dist.retailers.business_name}</span>
                              {dist.brand_matched && (
                                <Badge variant="outline" className="text-xs">
                                  {dist.brand_matched}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-medium">${dist.lead_price.toFixed(2)}</span>
                              <Badge 
                                variant={dist.was_paid ? "default" : "outline"}
                                className={dist.was_paid ? "bg-green-100 text-green-800" : ""}
                              >
                                {dist.was_paid ? 'Paid' : 'Pending'}
                              </Badge>
                              <span className="text-gray-500">
                                {format(new Date(dist.sent_at), 'MMM dd, HH:mm')}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {filteredLeads.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No leads found</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== "all" 
                ? "Try adjusting your filters to see more results."
                : "New leads will appear here when customers submit quote requests."
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminLeads;
