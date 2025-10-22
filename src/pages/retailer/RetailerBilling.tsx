
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { useDevMode } from '@/contexts/DevModeContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CreditCard, DollarSign, Calendar, Package, TrendingUp } from 'lucide-react';
import PaymentMethodsSection from '@/components/retailer/PaymentMethodsSection';

interface BillingStats {
  currentBalance: number;
  monthlySpend: number;
  leadsGenerated: number;
  nextBillingDate?: string;
}

interface BillingRecord {
  id: string;
  amount: number;
  billing_type: string;
  status: string;
  created_at: string;
  billing_period_start?: string;
  billing_period_end?: string;
}

const RetailerBilling = () => {
  const { user } = useAuth();
  const { isDevMode, mockBillingData } = useDevMode();
  const [stats, setStats] = useState<BillingStats>({
    currentBalance: 0,
    monthlySpend: 0,
    leadsGenerated: 0
  });
  const [billingHistory, setBillingHistory] = useState<BillingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [retailerId, setRetailerId] = useState<string | null>(null);

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      setLoading(true);
      
      if (isDevMode && mockBillingData) {
        // Use mock data in dev mode
        setStats({
          currentBalance: mockBillingData.currentBalance,
          monthlySpend: mockBillingData.monthlySpend,
          leadsGenerated: mockBillingData.leadsThisMonth,
          nextBillingDate: mockBillingData.nextBillingDate
        });
        setBillingHistory(mockBillingData.billingHistory);
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
      
      setRetailerId(profile.retailer_id);

      // Get retailer info
      const { data: retailer } = await supabase
        .from('retailers')
        .select('current_balance, next_billing_date, subscription_tier')
        .eq('id', profile.retailer_id)
        .single();

      // Get billing records
      const { data: billingRecords } = await supabase
        .from('billing_records')
        .select('*')
        .eq('retailer_id', profile.retailer_id)
        .order('created_at', { ascending: false })
        .limit(10);

      // Calculate monthly spend
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyRecords = billingRecords?.filter(record => {
        const recordDate = new Date(record.created_at);
        return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear;
      }) || [];

      const monthlySpend = monthlyRecords.reduce((sum, record) => sum + Number(record.amount), 0);

      // Get lead distributions count for this month
      const { count: leadsCount } = await supabase
        .from('lead_distributions')
        .select('*', { count: 'exact', head: true })
        .eq('retailer_id', profile.retailer_id)
        .gte('sent_at', new Date(currentYear, currentMonth, 1).toISOString());

      setStats({
        currentBalance: retailer?.current_balance || 0,
        monthlySpend,
        leadsGenerated: leadsCount || 0,
        nextBillingDate: retailer?.next_billing_date
      });

      setBillingHistory(billingRecords || []);
    } catch (error) {
      console.error('Error fetching billing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyCredits = async (amount: number) => {
    // This will integrate with Stripe
    console.log('Buying credits:', amount);
    // TODO: Implement Stripe payment flow
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

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
        <h1 className="text-2xl font-bold text-gray-900">Billing & Payments</h1>
        <Badge variant="default">
          Active
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Current Balance
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              ${stats.currentBalance.toFixed(2)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Available credits
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Monthly Spend
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              ${stats.monthlySpend.toFixed(2)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Leads This Month
            </CardTitle>
            <Package className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {stats.leadsGenerated}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Leads received
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Next Billing
            </CardTitle>
            <Calendar className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {stats.nextBillingDate ? new Date(stats.nextBillingDate).toLocaleDateString() : 'N/A'}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Upcoming charge
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button onClick={() => handleBuyCredits(50)} variant="outline" className="h-16">
              <div className="text-center">
                <div className="font-medium">$50</div>
                <div className="text-xs text-gray-500">Buy Credits</div>
              </div>
            </Button>
            <Button onClick={() => handleBuyCredits(100)} variant="outline" className="h-16">
              <div className="text-center">
                <div className="font-medium">$100</div>
                <div className="text-xs text-gray-500">Buy Credits</div>
              </div>
            </Button>
            <Button onClick={() => handleBuyCredits(250)} variant="outline" className="h-16">
              <div className="text-center">
                <div className="font-medium">$250</div>
                <div className="text-xs text-gray-500">Buy Credits</div>
              </div>
            </Button>
            <Button onClick={() => handleBuyCredits(500)} variant="outline" className="h-16">
              <div className="text-center">
                <div className="font-medium">$500</div>
                <div className="text-xs text-gray-500">Buy Credits</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      {retailerId && <PaymentMethodsSection retailerId={retailerId} />}

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {billingHistory.map((record) => (
              <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(record.status)}`}></div>
                  <div>
                    <div className="font-medium">
                      {record.billing_type === 'subscription' ? 'Monthly Subscription' : 'Lead Purchase'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(record.created_at).toLocaleDateString()}
                      {record.billing_period_start && record.billing_period_end && (
                        <span> • {new Date(record.billing_period_start).toLocaleDateString()} - {new Date(record.billing_period_end).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">${record.amount}</div>
                  <Badge variant={record.status === 'paid' ? 'default' : 'secondary'} className="text-xs">
                    {record.status}
                  </Badge>
                </div>
              </div>
            ))}
            {billingHistory.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No billing history available
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RetailerBilling;
