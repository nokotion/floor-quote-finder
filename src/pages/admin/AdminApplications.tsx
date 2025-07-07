import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Search, Eye, CheckCircle, XCircle, FileText } from 'lucide-react';

interface RetailerApplication {
  id: string;
  business_name: string;
  contact_name: string;
  email: string;
  phone: string;
  business_address: string | null;
  city: string;
  postal_code: string;
  website: string | null;
  business_description: string | null;
  years_in_business: number | null;
  brands_carried: string[] | null;
  services_offered: string[] | null;
  service_areas: string[] | null;
  insurance_provider: string | null;
  business_license: string | null;
  business_references: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
}

const AdminApplications = () => {
  const [applications, setApplications] = useState<RetailerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState<RetailerApplication | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('retailer_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveApplication = async (applicationId: string) => {
    try {
      setLoading(true);
      setError('');
      
      // Get current user for audit trail
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log('Approving application:', applicationId);
      
      // Call the edge function to create the complete retailer account
      const { data, error } = await supabase.functions.invoke('create-retailer-account', {
        body: {
          applicationId: applicationId,
          adminId: user.id
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to create retailer account');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to create retailer account');
      }

      console.log('Successfully created retailer account:', data);
      
      // Refresh the applications list
      await fetchApplications();
      
      // Show success message
      alert('Application approved successfully! The retailer has been sent their login credentials via email.');
      
    } catch (err: any) {
      console.error('Error approving application:', err);
      setError(err.message || 'Failed to approve application');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectApplication = async () => {
    if (!selectedApplication) return;

    try {
      setLoading(true);
      
      const { error: updateError } = await supabase
        .from('retailer_applications')
        .update({ 
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          notes: rejectionReason
        })
        .eq('id', selectedApplication.id);

      if (updateError) throw updateError;
      
      await fetchApplications();
      setShowRejectDialog(false);
      setRejectionReason('');
      setSelectedApplication(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending Review</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredApplications = applications.filter(application => {
    const matchesSearch = 
      application.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.contact_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || application.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading && applications.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Applications - Admin Dashboard</title>
        <meta name="description" content="Review and manage retailer applications." />
      </Helmet>
      
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Retailer Applications</h1>
          <p className="text-gray-600 mt-2">Review and manage new retailer applications</p>
        </div>

        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-600">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filter Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search applications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Applications</SelectItem>
                  <SelectItem value="pending">Pending Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Applications Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Applications ({filteredApplications.length})
            </CardTitle>
            <CardDescription>
              Review retailer applications and approve or reject them
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredApplications.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No applications found</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Business</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Experience</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Applied</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{application.business_name}</div>
                          {application.website && (
                            <div className="text-sm text-blue-600">
                              <a href={application.website} target="_blank" rel="noopener noreferrer">
                                {application.website}
                              </a>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{application.contact_name}</div>
                          <div className="text-sm text-gray-500">{application.email}</div>
                          <div className="text-sm text-gray-500">{application.phone}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div>{application.city}, {application.postal_code}</div>
                          {application.business_address && (
                            <div className="text-sm text-gray-500">{application.business_address}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {application.years_in_business ? (
                          <span>{application.years_in_business} years</span>
                        ) : (
                          <span className="text-gray-500">Not specified</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(application.status)}
                      </TableCell>
                      <TableCell>
                        {new Date(application.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>{application.business_name} - Application Details</DialogTitle>
                                <DialogDescription>
                                  Complete application information for review
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-6">
                                {/* Basic Information */}
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-semibold mb-2">Business Information</h4>
                                    <div className="space-y-2 text-sm">
                                      <div><strong>Business Name:</strong> {application.business_name}</div>
                                      <div><strong>Contact Person:</strong> {application.contact_name}</div>
                                      <div><strong>Email:</strong> {application.email}</div>
                                      <div><strong>Phone:</strong> {application.phone}</div>
                                      {application.website && (
                                        <div><strong>Website:</strong> 
                                          <a href={application.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 ml-1">
                                            {application.website}
                                          </a>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold mb-2">Location & Experience</h4>
                                    <div className="space-y-2 text-sm">
                                      {application.business_address && (
                                        <div><strong>Address:</strong> {application.business_address}</div>
                                      )}
                                      <div><strong>City:</strong> {application.city}</div>
                                      <div><strong>Postal Code:</strong> {application.postal_code}</div>
                                      {application.years_in_business && (
                                        <div><strong>Years in Business:</strong> {application.years_in_business}</div>
                                      )}
                                      {application.insurance_provider && (
                                        <div><strong>Insurance:</strong> {application.insurance_provider}</div>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Description */}
                                {application.business_description && (
                                  <div>
                                    <h4 className="font-semibold mb-2">Business Description</h4>
                                    <p className="text-sm bg-gray-50 p-3 rounded">{application.business_description}</p>
                                  </div>
                                )}

                                {/* Arrays */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  {application.brands_carried && application.brands_carried.length > 0 && (
                                    <div>
                                      <h4 className="font-semibold mb-2">Brands Carried</h4>
                                      <div className="flex flex-wrap gap-1">
                                        {application.brands_carried.map((brand, index) => (
                                          <Badge key={index} variant="outline" className="text-xs">{brand}</Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {application.services_offered && application.services_offered.length > 0 && (
                                    <div>
                                      <h4 className="font-semibold mb-2">Services Offered</h4>
                                      <div className="flex flex-wrap gap-1">
                                        {application.services_offered.map((service, index) => (
                                          <Badge key={index} variant="outline" className="text-xs">{service}</Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {application.service_areas && application.service_areas.length > 0 && (
                                    <div>
                                      <h4 className="font-semibold mb-2">Service Areas</h4>
                                      <div className="flex flex-wrap gap-1">
                                        {application.service_areas.map((area, index) => (
                                          <Badge key={index} variant="outline" className="text-xs">{area}</Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Additional Information */}
                                {(application.business_license || application.business_references) && (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {application.business_license && (
                                      <div>
                                        <h4 className="font-semibold mb-2">Business License</h4>
                                        <p className="text-sm bg-gray-50 p-3 rounded">{application.business_license}</p>
                                      </div>
                                    )}
                                    {application.business_references && (
                                      <div>
                                        <h4 className="font-semibold mb-2">References</h4>
                                        <p className="text-sm bg-gray-50 p-3 rounded">{application.business_references}</p>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Notes */}
                                {application.notes && (
                                  <div>
                                    <h4 className="font-semibold mb-2">Review Notes</h4>
                                    <p className="text-sm bg-red-50 p-3 rounded border-l-4 border-red-400">{application.notes}</p>
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>

                          {application.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleApproveApplication(application.id)}
                                disabled={loading}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  setSelectedApplication(application);
                                  setShowRejectDialog(true);
                                }}
                                disabled={loading}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                          
                          {application.status === 'approved' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleApproveApplication(application.id)}
                              disabled={loading}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Re-process
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Reject Dialog */}
        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Application</DialogTitle>
              <DialogDescription>
                Please provide a reason for rejecting this application. This will be recorded for reference.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                placeholder="Enter rejection reason..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleRejectApplication}
                disabled={!rejectionReason.trim() || loading}
              >
                Reject Application
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default AdminApplications;