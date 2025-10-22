import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, Plus, Trash2, Loader2 } from 'lucide-react';
import { useDevMode } from '@/contexts/DevModeContext';
import { AddPaymentMethodDialog } from './AddPaymentMethodDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(null);

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

  const confirmDelete = (id: string) => {
    setSelectedMethodId(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedMethodId) return;

    if (isDevMode) {
      toast({
        title: "Success",
        description: "Payment method removed (dev mode)",
      });
      setPaymentMethods(prev => prev.filter(pm => pm.id !== selectedMethodId));
      setDeleteDialogOpen(false);
      setSelectedMethodId(null);
      return;
    }

    try {
      const { error } = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', selectedMethodId);

      if (error) throw error;

      setPaymentMethods(prev => prev.filter(pm => pm.id !== selectedMethodId));
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
    } finally {
      setDeleteDialogOpen(false);
      setSelectedMethodId(null);
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

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <CreditCard className="w-5 h-5 mr-2" />
              Payment Methods
            </div>
            <Button size="sm" variant="outline" onClick={() => setAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Card
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : paymentMethods.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">No payment methods added yet</p>
              <p className="text-xs mt-1">Add a card to automatically pay for leads when you have no credits</p>
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
                      onClick={() => confirmDelete(method.id)}
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

      <AddPaymentMethodDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        retailerId={retailerId}
        onSuccess={fetchPaymentMethods}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Payment Method</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this payment method? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default PaymentMethodsSection;
