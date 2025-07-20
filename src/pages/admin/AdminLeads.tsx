import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Search, Eye, UserCheck, Mail } from 'lucide-react';

interface Lead {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  postal_code: string;
  flooring_type: string | null;
  square_footage: number | null;
  brand_requested: string | null;
  budget_range: string | null;
  timeline: string | null;
  status: string;
  is_verified: boolean;
  created_at: string;
  assigned_retailer_id: string | null;
  retailers?: {
    business_name: string;
  } | null;
}

const AdminLeads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select(`
          id,
          customer_name,
          customer_email,
          customer_phone,
          postal_code,
          flooring_type,
          square_footage,
          brand_requested,
          budget_range,
          timeline,
          status,
          is_verified,
          created_at,
          assigned_retailer_id,
          retailers:assigned_retailer_id (
            business_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge variant="secondary">New</Badge>;
      case 'assigned':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Assigned</Badge>;
      case 'quoted':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Quoted</Badge>;
      case 'closed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Closed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.postal_code.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    
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
        <title>Leads - Admin Dashboard</title>
        <meta name="description" content="Manage all customer leads and their assignments." />
      </Helmet>
      
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customer Leads</h1>
          <p className="text-gray-600 mt-2">Manage all customer leads and their assignments</p>
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
            <CardTitle>Filter Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search leads..."
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
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="quoted">Quoted</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Leads Table */}
        <Card>
          <CardHeader>
            <CardTitle>Leads ({filteredLeads.length})</CardTitle>
            <CardDescription>
              Complete list of all customer leads
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredLeads.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No leads found</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Project Details</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {lead.customer_name}
                            {lead.is_verified && (
                              <UserCheck className="w-4 h-4 text-green-600" />
                            )}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {lead.customer_email}
                          </div>
                          {lead.customer_phone && (
                            <div className="text-sm text-gray-500">{lead.customer_phone}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{lead.postal_code}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {lead.flooring_type && (
                            <div><strong>Type:</strong> {lead.flooring_type}</div>
                          )}
                          {lead.square_footage && (
                            <div><strong>Size:</strong> {lead.square_footage} sq ft</div>
                          )}
                          {lead.brand_requested && (
                            <div><strong>Brand:</strong> {lead.brand_requested}</div>
                          )}
                          {lead.budget_range && (
                            <div><strong>Budget:</strong> {lead.budget_range}</div>
                          )}
                          {lead.timeline && (
                            <div><strong>Timeline:</strong> {lead.timeline}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(lead.status)}
                      </TableCell>
                      <TableCell>
                        {lead.retailers ? (
                          <span className="text-sm">{lead.retailers.business_name}</span>
                        ) : (
                          <span className="text-gray-500 text-sm">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(lead.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
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

export default AdminLeads;
