
import { useState, useEffect } from "react";
import { useAuth } from '@/components/auth/AuthContext';
import { useDevMode } from '@/contexts/DevModeContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Phone, Mail, Package, Tag, Camera, Wrench, Calendar, DollarSign } from "lucide-react";
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

const RetailerLeads = () => {
  const { user } = useAuth();
  const { isDevMode, mockLeads } = useDevMode();
  const [leadDistributions, setLeadDistributions] = useState<LeadDistribution[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchLeadDistributions();
  }, []);

  const fetchLeadDistributions = async () => {
    try {
      setLoading(true);
      
      if (isDevMode && mockLeads) {
        // Transform mock leads to match LeadDistribution format
        const mockDistributions = mockLeads.map((lead, index) => ({
          id: `dist-${lead.id}`,
          lead_price: lead.lead_price,
          sent_at: lead.created_at,
          status: lead.distribution_status,
          brand_matched: lead.brand_matched,
          was_paid: index === 0, // First lead is paid
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
            created_at
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

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
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
        <h1 className="text-2xl font-bold mb-2">Your Leads</h1>
        <p className="text-gray-600">
          Manage and respond to customer inquiries
        </p>
      </div>

      {leadDistributions.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No leads yet</h3>
            <p className="text-gray-600">
              New leads will appear here when customers request quotes matching your criteria.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {leadDistributions.map((distribution) => {
            const lead = distribution.leads;
            return (
              <Card key={distribution.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl flex items-center gap-2">
                        {lead.customer_name}
                        {distribution.was_paid ? (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Paid
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            Pending Payment
                          </Badge>
                        )}
                      </CardTitle>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(distribution.sent_at), 'MMM dd, yyyy')}
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          ${distribution.lead_price.toFixed(2)}
                        </div>
                      </div>
                    </div>
                    <Badge 
                      variant={distribution.status === 'sent' ? 'default' : 'secondary'}
                      className="capitalize"
                    >
                      {distribution.status}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Contact Information */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Contact Information
                      </h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <Mail className="w-3 h-3 text-gray-400" />
                          <a href={`mailto:${lead.customer_email}`} className="text-blue-600 hover:underline">
                            {lead.customer_email}
                          </a>
                        </div>
                        {lead.customer_phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-3 h-3 text-gray-400" />
                            <a href={`tel:${lead.customer_phone}`} className="text-blue-600 hover:underline">
                              {lead.customer_phone}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Location
                      </h4>
                      <div className="text-sm space-y-1">
                        {lead.address_formatted ? (
                          <p>{lead.address_formatted}</p>
                        ) : (
                          <div>
                            {lead.street_address && <p>{lead.street_address}</p>}
                            <p>
                              {lead.address_city && `${lead.address_city}, `}
                              {lead.address_province} {lead.postal_code}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Project Details */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      Project Details
                    </h4>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">Flooring Type:</span>
                        <p className="flex items-center gap-1">
                          <Tag className="w-3 h-3 text-orange-500" />
                          {formatFlooringType(lead.flooring_type)}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Brand:</span>
                        <p>{lead.brand_requested || distribution.brand_matched || 'Any brand'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Size:</span>
                        <p>{getSquareFootageTier(lead.square_footage)}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Installation:</span>
                        <p className="flex items-center gap-1">
                          {lead.installation_required ? (
                            <>
                              <Wrench className="w-3 h-3 text-green-500" />
                              Required
                            </>
                          ) : (
                            <>
                              <span className="w-3 h-3 inline-block" />
                              Not required
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {lead.notes && (
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Customer Notes:</h4>
                      <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded-lg">
                        {lead.notes}
                      </p>
                    </div>
                  )}

                  {/* Attachments */}
                  {lead.attachment_urls && lead.attachment_urls.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
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

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      onClick={() => window.open(`mailto:${lead.customer_email}?subject=Quote for your flooring project`, '_blank')}
                      className="flex items-center gap-2"
                    >
                      <Mail className="w-4 h-4" />
                      Send Quote
                    </Button>
                    {lead.customer_phone && (
                      <Button
                        variant="outline"
                        onClick={() => window.open(`tel:${lead.customer_phone}`, '_self')}
                        className="flex items-center gap-2"
                      >
                        <Phone className="w-4 h-4" />
                        Call Customer
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RetailerLeads;
