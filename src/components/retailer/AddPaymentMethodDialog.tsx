import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Loader2 } from "lucide-react";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "");

interface AddPaymentMethodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  retailerId: string;
  onSuccess: () => void;
}

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: 'hsl(var(--foreground))',
      '::placeholder': {
        color: 'hsl(var(--muted-foreground))',
      },
      backgroundColor: 'transparent',
    },
    invalid: {
      color: 'hsl(var(--destructive))',
    },
  },
};

function AddPaymentForm({ retailerId, onSuccess, onCancel }: { 
  retailerId: string; 
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);

    try {
      // Call edge function to create setup intent
      const { data: setupData, error: setupError } = await supabase.functions.invoke(
        'create-setup-intent',
        {
          body: { retailer_id: retailerId }
        }
      );

      if (setupError) throw setupError;

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error('Card element not found');

      // Confirm the setup intent
      const { error: confirmError, setupIntent } = await stripe.confirmCardSetup(
        setupData.clientSecret,
        {
          payment_method: {
            card: cardElement,
          },
        }
      );

      if (confirmError) {
        throw new Error(confirmError.message);
      }

      if (setupIntent.status === 'succeeded') {
        toast({
          title: "Payment method added",
          description: "Your card has been saved successfully.",
        });
        onSuccess();
      }

    } catch (error: any) {
      console.error('Error adding payment method:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add payment method",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border rounded-lg bg-card">
        <CardElement options={CARD_ELEMENT_OPTIONS} />
      </div>
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={!stripe || loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Add Card
        </Button>
      </div>
    </form>
  );
}

export function AddPaymentMethodDialog({ 
  open, 
  onOpenChange, 
  retailerId,
  onSuccess 
}: AddPaymentMethodDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Payment Method</DialogTitle>
          <DialogDescription>
            Add a credit or debit card to pay for leads. Your card information is securely processed by Stripe.
          </DialogDescription>
        </DialogHeader>
        <Elements stripe={stripePromise}>
          <AddPaymentForm 
            retailerId={retailerId}
            onSuccess={() => {
              onSuccess();
              onOpenChange(false);
            }}
            onCancel={() => onOpenChange(false)}
          />
        </Elements>
      </DialogContent>
    </Dialog>
  );
}
