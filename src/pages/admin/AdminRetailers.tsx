import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Search, Eye, MoreHorizontal, Plus, Tags, Users } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface Retailer {
  id: string;
  business_name: string;
  contact_name: string;
  email: string;
  phone: string | null;
  city: string | null;
  province: string | null;
  status: string;
  created_at: string;
  leads_used_this_month: number;
  monthly_budget_cap: number;
}

const AdminRetailers = () => {
  const [retailers, setRetailers] = useState<Retailer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchRetailers();
  }, []);

  const fetchRetailers = async () => {
    try {
      const { data, error } = await supabase
        .from('retailers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRetailers(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (retailerId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('retailers')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', retailerId);

      if (error) throw error;
      
      // Refresh retailers
      await fetchRetailers();
    } catch (err: any) {
      setError(err.message);
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

  const filteredRetailers = retailers.filter(retailer => {
    const matchesSearch = 
      retailer.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      retailer.contact_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      retailer.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || retailer.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Retailers - Admin Dashboard</title>
        <meta name="description" content="Manage all registered retailers and their accounts." />
      </Helmet>
      
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Retailers</h1>
            <p className="text-gray-600 mt-2">Manage all registered retailers and their accounts</p>
          </div>
          <Button asChild>
            <Link to="/admin/retailers/new">
              <Plus className="w-4 h-4 mr-2" />
              Add Retailer
            </Link>
          </Button>
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
            <CardTitle>Filter Retailers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search retailers..."
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
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Retailers Table */}
        <Card>
          <CardHeader>
            <CardTitle>Retailers ({filteredRetailers.length})</CardTitle>
            <CardDescription>
              Complete list of all registered retailers
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredRetailers.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No retailers found</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Business</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="w-20">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRetailers.map((retailer) => (
                    <TableRow key={retailer.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{retailer.business_name}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{retailer.contact_name}</div>
                          <div className="text-sm text-gray-500">{retailer.email}</div>
                          {retailer.phone && (
                            <div className="text-sm text-gray-500">{retailer.phone}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {retailer.city && retailer.province ? (
                          <span>{retailer.city}, {retailer.province}</span>
                        ) : (
                          <span className="text-gray-500">Not specified</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(retailer.status)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{retailer.leads_used_this_month || 0} leads this month</div>
                          <div className="text-gray-500">
                            Budget: ${retailer.monthly_budget_cap || 0}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(retailer.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to={`/admin/retailers/${retailer.id}`}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link to={`/admin/retailers/${retailer.id}?tab=leads`}>
                                <Users className="w-4 h-4 mr-2" />
                                View Leads
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link to={`/admin/retailers/${retailer.id}?tab=subscriptions`}>
                                <Tags className="w-4 h-4 mr-2" />
                                Brand Subscriptions
                              </Link>
                            </DropdownMenuItem>
                            {retailer.status === 'pending' && (
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(retailer.id, 'approved')}
                              >
                                Approve
                              </DropdownMenuItem>
                            )}
                            {retailer.status === 'approved' && (
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(retailer.id, 'suspended')}
                              >
                                Suspend
                              </DropdownMenuItem>
                            )}
                            {retailer.status === 'suspended' && (
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(retailer.id, 'approved')}
                              >
                                Reactivate
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default AdminRetailers;