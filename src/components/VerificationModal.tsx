
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
      console.log("Creating temporary lead via edge function:", {
        email,
        phone,
        method: selectedMethod
      });

      // Create temporary lead using edge function (bypasses RLS)
      const { data: tempLeadResponse, error: tempLeadError } = await supabase.functions.invoke('insert-temp-lead', {
        body: {
          email,
          phone,
          method: selectedMethod
        }
      });

      console.log('insert-temp-lead result:', { tempLeadResponse, tempLeadError });

      if (tempLeadError) {
        console.error('Temp lead creation error:', tempLeadError);
        throw tempLeadError;
      }

      if (!tempLeadResponse.success) {
        throw new Error(tempLeadResponse.error || 'Failed to create temporary lead');
      }

      console.log('Temporary lead created successfully:', tempLeadResponse.leadId);
      setTempLeadId(tempLeadResponse.leadId);

      // Send verification code
      console.log('Calling send-verification with:', {
        leadId: tempLeadResponse.leadId,
        method: selectedMethod,
        contact: selectedMethod === 'email' ? email : phone,
      });

      const { data, error } = await supabase.functions.invoke('send-verification', {
        body: {
          leadId: tempLeadResponse.leadId,
          method: selectedMethod,
          contact: selectedMethod === 'email' ? email : phone,
        },
      });

      console.log('send-verification result:', { data, error });

      // Handle edge function errors first
      if (error) {
        console.error('Edge function invocation error:', error);
        toast({
          title: "Verification Failed",
          description: `Service error: ${error.message}`,
          variant: "destructive",
        });
        throw error;
      }

      // Check for errors in the response data
      if (data?.error) {
        console.error('Edge function returned error:', data.error);
        
        // Show specific error message based on error type
        let errorMessage = data.error;
        let errorTitle = "Verification Failed";
        
        if (data.errorType === 'VERIFICATION_SEND_FAILED' && selectedMethod === 'sms') {
          errorTitle = "SMS Service Unavailable";
          errorMessage = data.error;
          
          // Suggest email as fallback for SMS issues
          toast({
            title: errorTitle,
            description: `${errorMessage} Would you like to try email verification instead?`,
            variant: "destructive",
          });
          
          // Auto-switch to email if SMS fails due to auth issues
          if (data.error.includes('Authentication Error') || data.error.includes('authentication failed')) {
            setSelectedMethod('email');
            toast({
              title: "Switched to Email",
              description: "SMS service is unavailable. Please try email verification.",
            });
          }
          throw new Error(data.error);
        }
        
        toast({
          title: errorTitle,
          description: errorMessage,
          variant: "destructive",
        });
        throw new Error(data.error);
      }

      // Check for success - handle both direct and nested response structures
      const success = data?.success || data?.body?.success;
      
      if (success) {
        console.log('✅ Verification sent successfully');
        toast({
          title: "Verification Sent",
          description: `A verification code has been sent to your ${selectedMethod === 'email' ? 'email' : 'phone'}.`,
        });
        setStep('code');
        setCountdown(60);
      } else {
        console.error('Unexpected response structure:', data);
        toast({
          title: "Verification Failed",
          description: "Unexpected response from server. Please try again.",
          variant: "destructive",
        });
        throw new Error('Unexpected response structure');
      }
    } catch (error: any) {
      console.error('Full verification send error:', error);
      
      // Don't show toast again if we already showed one above
      if (!error.message?.includes('Service error:') && !error.message?.includes('Unexpected response')) {
        toast({
          title: "Verification Failed",
          description: error.message || 'Failed to send verification code. Please try again.',
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!tempLeadId || verificationCode.length !== 6) return;

    setIsLoading(true);

    try {
      console.log('Calling verify-lead with:', {
        leadId: tempLeadId,
        token: verificationCode, // Changed from 'code' to 'token' to match edge function
      });

      const { data, error } = await supabase.functions.invoke('verify-lead', {
        body: {
          leadId: tempLeadId,
          token: verificationCode, // Changed from 'code' to 'token' to match edge function
        },
      });

      console.log('verify-lead result:', { data, error });

      if (error) {
        console.error('verify-lead edge function error:', error);
        throw error;
      }

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
