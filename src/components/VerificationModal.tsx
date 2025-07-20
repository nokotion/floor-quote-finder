
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, MessageSquare, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface VerificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
  phone: string;
  onVerificationSuccess: () => void;
}

export const VerificationModal = ({ 
  open, 
  onOpenChange, 
  email, 
  phone, 
  onVerificationSuccess 
}: VerificationModalProps) => {
  const [step, setStep] = useState<'method' | 'code'>('method');
  const [selectedMethod, setSelectedMethod] = useState<'email' | 'sms'>('email');
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [tempLeadId, setTempLeadId] = useState<string | null>(null);
  const { toast } = useToast();

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setStep('method');
      setVerificationCode("");
      setCountdown(0);
      setTempLeadId(null);
    }
  }, [open]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendVerification = async () => {
    setIsLoading(true);

    try {
      console.log("Creating temporary lead for verification:", {
        customer_name: 'TEMP_VERIFICATION',
        customer_email: email,
        customer_phone: phone,
        postal_code: 'TEMP',
        status: 'pending_verification',
        is_verified: false
      });

      // Create a temporary lead record for verification
      const { data: leadData, error: leadError } = await supabase
        .from('leads')
        .insert([{
          customer_name: 'TEMP_VERIFICATION',
          customer_email: email,
          customer_phone: phone,
          postal_code: 'TEMP',
          status: 'pending_verification',
          is_verified: false
        }])
        .select()
        .single();

      if (leadError) {
        console.error('Lead creation error:', leadError);
        throw leadError;
      }

      console.log('Temporary lead created successfully:', leadData.id);
      setTempLeadId(leadData.id);

      // Send verification code
      const { data, error } = await supabase.functions.invoke('send-verification', {
        body: {
          leadId: leadData.id,
          method: selectedMethod,
          contact: selectedMethod === 'email' ? email : phone,
        },
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Verification Sent",
          description: `A verification code has been sent to your ${selectedMethod === 'email' ? 'email' : 'phone'}.`,
        });
        setStep('code');
        setCountdown(60);
      } else {
        throw new Error(data.error || 'Failed to send verification');
      }
    } catch (error: any) {
      console.error('Verification send error:', error);
      toast({
        title: "Verification Failed",
        description: error.message || "Failed to send verification code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!tempLeadId || verificationCode.length !== 6) return;

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('verify-lead', {
        body: {
          leadId: tempLeadId,
          code: verificationCode,
        },
      });

      if (error) throw error;

      if (data.success) {
        // Clean up temporary lead
        await supabase.from('leads').delete().eq('id', tempLeadId);
        
        toast({
          title: "Verification Successful",
          description: "Your contact information has been verified.",
        });
        onVerificationSuccess();
        onOpenChange(false);
      } else {
        throw new Error(data.error || 'Invalid verification code');
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid verification code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = () => {
    if (countdown === 0) {
      handleSendVerification();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === 'method' ? 'Verify Your Contact' : 'Enter Verification Code'}
          </DialogTitle>
          <DialogDescription>
            {step === 'method' 
              ? 'Choose how you would like to receive your verification code.'
              : `We sent a 6-digit code to your ${selectedMethod === 'email' ? 'email' : 'phone'}.`
            }
          </DialogDescription>
        </DialogHeader>

        {step === 'method' ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant={selectedMethod === 'email' ? 'default' : 'outline'}
                onClick={() => setSelectedMethod('email')}
                className="h-16 flex flex-col items-center space-y-2"
              >
                <Mail className="h-5 w-5" />
                <span>Email</span>
              </Button>
              <Button
                variant={selectedMethod === 'sms' ? 'default' : 'outline'}
                onClick={() => setSelectedMethod('sms')}
                className="h-16 flex flex-col items-center space-y-2"
              >
                <MessageSquare className="h-5 w-5" />
                <span>SMS</span>
              </Button>
            </div>

            <div className="text-sm text-muted-foreground text-center">
              {selectedMethod === 'email' ? `Code will be sent to: ${email}` : `Code will be sent to: ${phone}`}
            </div>

            <Button 
              onClick={handleSendVerification} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Verification Code
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label htmlFor="verification-code">Verification Code</Label>
              <Input
                id="verification-code"
                type="text"
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                className="text-center text-lg tracking-widest"
              />
            </div>

            <Button 
              onClick={handleVerifyCode} 
              disabled={isLoading || verificationCode.length !== 6}
              className="w-full"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verify Code
            </Button>

            <div className="text-center">
              <Button 
                variant="link" 
                onClick={handleResendCode}
                disabled={countdown > 0}
                className="text-sm"
              >
                {countdown > 0 ? `Resend code in ${countdown}s` : 'Resend code'}
              </Button>
            </div>

            <div className="text-center">
              <Button 
                variant="ghost" 
                onClick={() => setStep('method')}
                className="text-sm"
              >
                Change verification method
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
