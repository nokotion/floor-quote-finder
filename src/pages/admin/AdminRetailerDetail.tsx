import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Loader2, 
  ArrowLeft, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Building2,
  Globe,
  TrendingUp,
  CreditCard,
  Send
} from 'lucide-react';

interface Retailer {
  id: string;
  business_name: string;
  contact_name: string;
  email: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  postal_code: string | null;
  website: string | null;
  business_description: string | null;
  years_in_business: number | null;
  status: string;
  created_at: string;
  updated_at: string;
  brands_carried: string[] | null;
  services_offered: string[] | null;
  coverage_postal_codes: string[] | null;
  leads_used_this_month: number;
  monthly_budget_cap: number;
  current_balance: number;
}

interface LeadDistribution {
  id: string;
  lead_price: number;
  sent_at: string;
  status: string;
  brand_matched: string | null;
  distance_km: number | null;
  leads: {
    customer_name: string;
    customer_email: string;
    postal_code: string;
    flooring_type: string | null;
    square_footage: number | null;
  } | null;
}

interface BrandSubscription {
  id: string;
  brand_name: string;
  is_active: boolean;
  lead_price: number | null;
  min_square_footage: number | null;
  max_square_footage: number | null;
  created_at: string;
  updated_at: string;
}

const AdminRetailerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const [retailer, setRetailer] = useState<Retailer | null>(null);
  const [leadDistributions, setLeadDistributions] = useState<LeadDistribution[]>([]);
  const [brandSubscriptions, setBrandSubscriptions] = useState<BrandSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchRetailerDetails();
    }
  }, [id]);

  const fetchRetailerDetails = async () => {
    try {
      // Fetch retailer details
      const { data: retailerData, error: retailerError } = await supabase
        .from('retailers')
        .select('*')
        .eq('id', id)
        .single();

      if (retailerError) throw retailerError;

      // Fetch lead distributions
      const { data: distributionsData, error: distributionsError } = await supabase
        .from('lead_distributions')
        .select(`
          *,
          leads:lead_id (
            customer_name,
            customer_email,
            postal_code,
            flooring_type,
            square_footage
          )
        `)
        .eq('retailer_id', id)
        .order('sent_at', { ascending: false })
        .limit(20);

      if (distributionsError) throw distributionsError;

      // Fetch brand subscriptions
      const { data: subscriptionsData, error: subscriptionsError } = await supabase
        .from('brand_subscriptions')
        .select('*')
        .eq('retailer_id', id)
        .order('created_at', { ascending: false });

      if (subscriptionsError) throw subscriptionsError;

      setRetailer(retailerData);
      setLeadDistributions(distributionsData || []);
      setBrandSubscriptions(subscriptionsData || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!retailer) return;

    try {
      const { error } = await supabase
        .from('retailers')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', retailer.id);

      if (error) throw error;
      
      setRetailer({ ...retailer, status: newStatus });
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSendCredentials = async () => {
    if (!retailer) return;

    setSendingEmail(true);
    try {
      const { data, error } = await supabase.functions.invoke('resend-retailer-credentials', {
        body: { retailerId: retailer.id }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Login credentials sent successfully",
      });
    } catch (err: any) {
      console.error('Error sending credentials:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to send login credentials",
        variant: "destructive",
      });
    } finally {
      setSendingEmail(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>;
      case 'suspended':
        return <Badge variant="destructive">Suspended</Badge>;
      case 'rejected':
        return <Badge variant="outline">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!retailer) {
    return (
      <div className="p-6">
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-600">
            Retailer not found
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{retailer.business_name} - Admin Dashboard</title>
        <meta name="description" content={`Retailer details for ${retailer.business_name}`} />
      </Helmet>
      
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/admin/retailers">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Retailers
            </Link>
          </Button>
        </div>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{retailer.business_name}</h1>
            <p className="text-gray-600 mt-2">Retailer Details & Management</p>
          </div>
          <div className="flex gap-2">
            {getStatusBadge(retailer.status)}
            {retailer.status === 'pending' && (
              <Button onClick={() => handleStatusChange('approved')}>
                Approve
              </Button>
            )}
            {retailer.status === 'approved' && (
              <>
                <Button 
                  variant="outline" 
                  onClick={handleSendCredentials}
                  disabled={sendingEmail}
                >
                  {sendingEmail ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  Send Login Credentials
                </Button>
                <Button variant="outline" onClick={() => handleStatusChange('suspended')}>
                  Suspend
                </Button>
              </>
            )}
            {retailer.status === 'suspended' && (
              <Button onClick={() => handleStatusChange('approved')}>
                Reactivate
              </Button>
            )}
          </div>
        </div>

        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-600">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue={searchParams.get('tab') || 'overview'} className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="leads">Lead History</TabsTrigger>
            <TabsTrigger value="subscriptions">Brand Subscriptions</TabsTrigger>
            <TabsTrigger value="billing">Billing & Usage</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Contact Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Business Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span>{retailer.email}</span>
                  </div>
                  {retailer.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span>{retailer.phone}</span>
                    </div>
                  )}
                  {(retailer.address || retailer.city) && (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-gray-500 mt-1" />
                      <div>
                        {retailer.address && <div>{retailer.address}</div>}
                        <div>
                          {retailer.city && retailer.province 
                            ? `${retailer.city}, ${retailer.province}` 
                            : retailer.city || retailer.province
                          }
                          {retailer.postal_code && ` ${retailer.postal_code}`}
                        </div>
                      </div>
                    </div>
                  )}
                  {retailer.website && (
                    <div className="flex items-center gap-3">
                      <Globe className="w-4 h-4 text-gray-500" />
                      <a 
                        href={retailer.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {retailer.website}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span>Joined {new Date(retailer.created_at).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Business Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Contact Person</label>
                    <div>{retailer.contact_name}</div>
                  </div>
                  {retailer.years_in_business && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Years in Business</label>
                      <div>{retailer.years_in_business} years</div>
                    </div>
                  )}
                  {retailer.business_description && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Description</label>
                      <div className="text-sm">{retailer.business_description}</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Services and Coverage */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {retailer.brands_carried && retailer.brands_carried.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Brands Carried</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {retailer.brands_carried.map((brand, index) => (
                        <Badge key={index} variant="outline">{brand}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {retailer.services_offered && retailer.services_offered.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Services Offered</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {retailer.services_offered.map((service, index) => (
                        <Badge key={index} variant="outline">{service}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {retailer.coverage_postal_codes && retailer.coverage_postal_codes.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Coverage Areas</CardTitle>
                  <CardDescription>Postal codes where this retailer provides services</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {retailer.coverage_postal_codes.map((code, index) => (
                      <Badge key={index} variant="secondary">{code}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="leads" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Lead Distributions</CardTitle>
                <CardDescription>
                  Leads sent to this retailer (last 20)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {leadDistributions.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No leads distributed yet</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Details</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leadDistributions.map((distribution) => (
                        <TableRow key={distribution.id}>
                          <TableCell>
                            {distribution.leads ? (
                              <div>
                                <div className="font-medium">{distribution.leads.customer_name}</div>
                                <div className="text-sm text-gray-500">{distribution.leads.customer_email}</div>
                              </div>
                            ) : (
                              <span className="text-gray-500">N/A</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {distribution.leads?.postal_code || 'N/A'}
                            {distribution.distance_km && (
                              <div className="text-sm text-gray-500">
                                {Math.round(distribution.distance_km)}km away
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {distribution.leads ? (
                              <div className="text-sm">
                                {distribution.leads.flooring_type && (
                                  <div>{distribution.leads.flooring_type}</div>
                                )}
                                {distribution.leads.square_footage && (
                                  <div>{distribution.leads.square_footage} sq ft</div>
                                )}
                                {distribution.brand_matched && (
                                  <div className="text-gray-500">Brand: {distribution.brand_matched}</div>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-500">N/A</span>
                            )}
                          </TableCell>
                          <TableCell>${distribution.lead_price}</TableCell>
                          <TableCell>
                            <Badge variant={distribution.status === 'sent' ? 'secondary' : 'outline'}>
                              {distribution.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(distribution.sent_at).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscriptions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Brand Subscriptions</CardTitle>
                <CardDescription>
                  Brands this retailer is subscribed to receive leads for
                </CardDescription>
              </CardHeader>
              <CardContent>
                {brandSubscriptions.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No brand subscriptions configured</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Brand Name</TableHead>
                        <TableHead>Lead Price</TableHead>
                        <TableHead>Square Footage Range</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Last Updated</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {brandSubscriptions.map((subscription) => (
                        <TableRow key={subscription.id}>
                          <TableCell>
                            <div className="font-medium">{subscription.brand_name}</div>
                          </TableCell>
                          <TableCell>
                            {subscription.lead_price ? `$${subscription.lead_price}` : 'Not set'}
                          </TableCell>
                          <TableCell>
                            {subscription.min_square_footage || subscription.max_square_footage ? (
                              <div className="text-sm">
                                {subscription.min_square_footage || 0} - {subscription.max_square_footage || '∞'} sq ft
                              </div>
                            ) : (
                              <span className="text-gray-500">No restrictions</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={subscription.is_active ? 'default' : 'secondary'}>
                              {subscription.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(subscription.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {new Date(subscription.updated_at).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${retailer.current_balance || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Budget</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${retailer.monthly_budget_cap || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Leads This Month</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{retailer.leads_used_this_month || 0}</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default AdminRetailerDetail;