import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { 
  Loader2, 
  Users, 
  FileText, 
  TrendingUp, 
  Clock,
  CheckCircle2,
  Store,
  Activity
} from 'lucide-react';

interface RetailerApplication {
  id: string;
  business_name: string;
  contact_name: string;
  email: string;
  phone: string;
  city: string;
  postal_code: string;
  status: string;
  created_at: string;
}

interface DashboardStats {
  totalApplications: number;
  pendingApplications: number;
  approvedRetailers: number;
  totalLeads: number;
}

const AdminDashboard = () => {
  const [applications, setApplications] = useState<RetailerApplication[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalApplications: 0,
    pendingApplications: 0,
    approvedRetailers: 0,
    totalLeads: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch applications
      const { data: applicationsData, error: applicationsError } = await supabase
        .from('retailer_applications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (applicationsError) throw applicationsError;

      // Fetch stats
      const [
        { count: totalApplications },
        { count: pendingApplications },
        { count: approvedRetailers },
        { count: totalLeads }
      ] = await Promise.all([
        supabase.from('retailer_applications').select('*', { count: 'exact', head: true }),
        supabase.from('retailer_applications').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('retailers').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
        supabase.from('leads').select('*', { count: 'exact', head: true })
      ]);

      setApplications(applicationsData || []);
      setStats({
        totalApplications: totalApplications || 0,
        pendingApplications: pendingApplications || 0,
        approvedRetailers: approvedRetailers || 0,
        totalLeads: totalLeads || 0
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveApplication = async (applicationId: string) => {
    try {
      setLoading(true);
      
      // Call the create retailer account edge function
      const { data, error } = await supabase.functions.invoke('create-retailer-account', {
        body: { 
          applicationId,
          adminId: '03c68991-ed22-482a-9d66-b8bcdbe6c524' // Current admin ID
        }
      });

      if (error) throw error;

      // Refresh data
      await fetchDashboardData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

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
        <title>Admin Dashboard - Price My Floor</title>
        <meta name="description" content="Administrative dashboard for managing retailer applications and system overview." />
      </Helmet>
      <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Welcome to your admin control center</p>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-600">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Applications</CardTitle>
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalApplications}</div>
            <p className="text-xs text-muted-foreground mt-1">This Month</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Review</CardTitle>
            <div className="p-2 bg-amber-100 rounded-lg">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.pendingApplications}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting Action</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Approved Retailers</CardTitle>
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.approvedRetailers}</div>
            <p className="text-xs text-muted-foreground mt-1">Active Partners</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Leads</CardTitle>
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalLeads}</div>
            <p className="text-xs text-muted-foreground mt-1">All Time</p>
          </CardContent>
        </Card>
      </div>

      {/* Platform Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <CardTitle>Recent Activity</CardTitle>
            </div>
            <CardDescription>Latest system activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded">
                  <FileText className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">New Applications</p>
                  <p className="text-xs text-muted-foreground">{stats.pendingApplications} pending review</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-100 rounded">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Lead Activity</p>
                  <p className="text-xs text-muted-foreground">{stats.totalLeads} total leads processed</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Store className="h-5 w-5 text-primary" />
              <CardTitle>Partner Network</CardTitle>
            </div>
            <CardDescription>Active retail partners</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Active Retailers</span>
                <span className="text-2xl font-bold">{stats.approvedRetailers}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Coverage Areas</span>
                <span className="text-2xl font-bold">-</span>
              </div>
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">Network growing steadily</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <CardTitle>Pending Reviews</CardTitle>
            </div>
            <CardDescription>Applications awaiting approval</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Pending Applications</span>
                <span className="text-2xl font-bold text-amber-600">{stats.pendingApplications}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Submitted</span>
                <span className="text-2xl font-bold">{stats.totalApplications}</span>
              </div>
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">Requires immediate attention</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Applications */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Retailer Applications</CardTitle>
          <CardDescription>
            Review and approve new retailer applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          {applications.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No applications found</p>
          ) : (
            <div className="space-y-4">
              {applications.map((application) => (
                <div
                  key={application.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="font-semibold">{application.business_name}</h4>
                    <p className="text-sm text-gray-600">
                      {application.contact_name} • {application.email}
                    </p>
                    <p className="text-sm text-gray-500">
                      {application.city}, {application.postal_code} • 
                      {new Date(application.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(application.status)}
                    {application.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => handleApproveApplication(application.id)}
                        disabled={loading}
                      >
                        Approve
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
    </>
  );
};

export default AdminDashboard;