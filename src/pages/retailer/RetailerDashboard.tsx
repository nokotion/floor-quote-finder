
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { useDevMode } from '@/contexts/DevModeContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Users, Package, TrendingUp, Plus, Mail, Settings } from 'lucide-react';

const RetailerDashboard = () => {
  const { user } = useAuth();
  const { isDevMode, mockBillingData, mockLeads, mockSubscriptions } = useDevMode();
  const [stats, setStats] = useState({
    totalLeads: 0,
    activeSubscriptions: 0,
    monthlySpend: 0,
    conversionRate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      
      if (isDevMode) {
        // Use mock data in dev mode
        setStats({
          totalLeads: mockLeads?.length || 0,
          activeSubscriptions: mockSubscriptions?.filter(s => s.is_active).length || 0,
          monthlySpend: mockBillingData?.monthlySpend || 0,
          conversionRate: 25 // Mock conversion rate
        });
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get retailer profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('retailer_id')
        .eq('id', user.id)
        .single();

      if (!profile?.retailer_id) return;

      // Fetch lead count
      const { count: leadCount } = await supabase
        .from('lead_distributions')
        .select('*', { count: 'exact', head: true })
        .eq('retailer_id', profile.retailer_id);

      // Fetch active subscriptions
      const { count: subscriptionCount } = await supabase
        .from('brand_subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('retailer_id', profile.retailer_id)
        .eq('is_active', true);

      setStats({
        totalLeads: leadCount || 0,
        activeSubscriptions: subscriptionCount || 0,
        monthlySpend: 0, // Will be calculated from billing records
        conversionRate: 0 // Will be calculated from lead responses
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Leads',
      value: stats.totalLeads,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Active Subscriptions',
      value: stats.activeSubscriptions,
      icon: Package,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Monthly Spend',
      value: `$${stats.monthlySpend}`,
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Conversion Rate',
      value: `${stats.conversionRate}%`,
      icon: TrendingUp,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50'
    }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
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
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Badge variant="outline" className="text-green-600 border-green-600">
          Active
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <p className="text-xs text-gray-500 mt-1">
                Updated just now
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {isDevMode && mockLeads && mockLeads.length > 0 ? (
                mockLeads.slice(0, 3).map((lead, index) => (
                  <div key={lead.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-sm">{lead.customer_name}</div>
                      <div className="text-xs text-gray-600">{lead.flooring_type} • {lead.square_footage} sqft</div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {lead.distribution_status}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500">
                  No recent activity to display.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start" onClick={() => window.location.href = '/retailer/leads'}>
              <Users className="w-4 h-4 mr-2" />
              View New Leads
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => window.location.href = '/retailer/subscriptions'}>
              <Package className="w-4 h-4 mr-2" />
              Manage Subscriptions
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => window.location.href = '/retailer/billing'}>
              <DollarSign className="w-4 h-4 mr-2" />
              Update Billing Information
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RetailerDashboard;
