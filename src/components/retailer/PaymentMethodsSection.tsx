import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, Plus, Trash2 } from 'lucide-react';
import { useDevMode } from '@/contexts/DevModeContext';

interface PaymentMethod {
  id: string;
  stripe_payment_method_id: string;
  card_brand: string;
  card_last4: string;
  card_exp_month: number;
  card_exp_year: number;
  is_default: boolean;
}

interface PaymentMethodsSectionProps {
  retailerId: string;
}

const PaymentMethodsSection = ({ retailerId }: PaymentMethodsSectionProps) => {
  const { toast } = useToast();
  const { isDevMode } = useDevMode();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  useEffect(() => {
    fetchPaymentMethods();
  }, [retailerId]);

  const fetchPaymentMethods = async () => {
    try {
      setLoading(true);
      
      if (isDevMode) {
        // Mock data for dev mode
        setPaymentMethods([
          {
            id: '1',
            stripe_payment_method_id: 'pm_mock_1',
            card_brand: 'visa',
            card_last4: '4242',
            card_exp_month: 12,
            card_exp_year: 2025,
            is_default: true
          }
        ]);
        return;
      }

      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('retailer_id', retailerId)
        .order('is_default', { ascending: false });

      if (error) throw error;
      setPaymentMethods(data || []);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      toast({
        title: "Error",
        description: "Failed to load payment methods",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (isDevMode) {
      toast({
        title: "Success",
        description: "Payment method removed (dev mode)",
      });
      setPaymentMethods(prev => prev.filter(pm => pm.id !== id));
      return;
    }

    try {
      const { error } = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPaymentMethods(prev => prev.filter(pm => pm.id !== id));
      toast({
        title: "Success",
        description: "Payment method removed",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSetDefault = async (id: string) => {
    if (isDevMode) {
      toast({
        title: "Success",
        description: "Default payment method updated (dev mode)",
      });
      setPaymentMethods(prev => prev.map(pm => ({
        ...pm,
        is_default: pm.id === id
      })));
      return;
    }

    try {
      // First, unset all defaults
      await supabase
        .from('payment_methods')
        .update({ is_default: false })
        .eq('retailer_id', retailerId);

      // Then set the new default
      const { error } = await supabase
        .from('payment_methods')
        .update({ is_default: true })
        .eq('id', id);

      if (error) throw error;

      setPaymentMethods(prev => prev.map(pm => ({
        ...pm,
        is_default: pm.id === id
      })));

      toast({
        title: "Success",
        description: "Default payment method updated",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getCardIcon = (brand: string) => {
    return <CreditCard className="w-8 h-8 text-muted-foreground" />;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Payment Methods
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-20 bg-muted/50 rounded animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Payment Methods
          </div>
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Card
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Payment Method</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="bg-muted/50 rounded-lg p-8 text-center">
                  <CreditCard className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Stripe payment integration will be added here.
                    Contact support to add payment methods.
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {paymentMethods.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">No payment methods added yet</p>
            <p className="text-xs mt-1">Add a credit card to enable auto-pay</p>
          </div>
        ) : (
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  {getCardIcon(method.card_brand)}
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium capitalize">
                        {method.card_brand} •••• {method.card_last4}
                      </span>
                      {method.is_default && (
                        <Badge variant="default" className="text-xs">
                          Default
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Expires {method.card_exp_month}/{method.card_exp_year}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {!method.is_default && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSetDefault(method.id)}
                    >
                      Set Default
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(method.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentMethodsSection;
