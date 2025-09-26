import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Check, Mail, MessageSquare, RefreshCw, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Verify = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const leadId = searchParams.get('leadId');
  const method = searchParams.get('method') as 'email' | 'sms';
  const contact = searchParams.get('contact');
  
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [canResend, setCanResend] = useState(false);

  // Redirect if missing required parameters
  useEffect(() => {
    if (!leadId || !method || !contact) {
      navigate('/', { replace: true });
    }
  }, [leadId, method, contact, navigate]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0 && !isVerified) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setCanResend(true);
    }
  }, [timeLeft, isVerified]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (verificationCode.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter a 6-digit verification code.",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);

    try {
      const { data, error } = await supabase.functions.invoke('verify-lead', {
        body: {
          leadId,
          token: verificationCode,
        },
      });

      if (error) {
        throw error;
      }

      if (data.success) {
        setIsVerified(true);
        toast({
          title: "Verification Successful!",
          description: data.message,
        });
      } else {
        throw new Error(data.error || 'Verification failed');
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      toast({
        title: "Verification Failed",
        description: error.message || 'Please check your code and try again.',
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);

    try {
      const { data, error } = await supabase.functions.invoke('send-verification', {
        body: {
          leadId,
          method,
          contact,
        },
      });

      if (error) {
        throw error;
      }

      if (data.success) {
        setTimeLeft(600); // Reset to 10 minutes
        setCanResend(false);
        toast({
          title: "Code Resent",
          description: `New verification code sent via ${method}.`,
        });
      } else {
        throw new Error(data.error || 'Failed to resend code');
      }
    } catch (error: any) {
      console.error('Resend error:', error);
      toast({
        title: "Resend Failed",
        description: error.message || 'Please try again later.',
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  if (isVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center py-12"
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Verification Successful!</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Your quote request has been verified and is now being processed. You'll receive quotes from verified retailers within 24-48 hours.
              </p>
              <div className="space-y-4">
                <Button asChild>
                  <Link to="/">Return Home</Link>
                </Button>
                <p className="text-sm text-gray-500">
                  Check your {method === 'email' ? 'email' : 'phone'} for quote updates.
                </p>
              </div>
            </motion.div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-50">

      {/* Verification Form */}
      <div className="flex items-center justify-center p-4 pt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                {method === 'email' ? (
                  <Mail className="w-8 h-8 text-orange-600" />
                ) : (
                  <MessageSquare className="w-8 h-8 text-orange-600" />
                )}
              </div>
              <CardTitle className="text-2xl">Verify Your Request</CardTitle>
              <p className="text-gray-600 mt-2">
                We've sent a 6-digit code to your {method === 'email' ? 'email' : 'phone'}
              </p>
              <p className="text-sm font-medium text-gray-800">
                {contact}
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <form onSubmit={handleVerify} className="space-y-4">
                <div>
                  <Label htmlFor="code">Verification Code</Label>
                  <Input
                    id="code"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    className="text-center text-2xl font-mono tracking-widest"
                    disabled={isVerifying}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={verificationCode.length !== 6 || isVerifying}
                >
                  {isVerifying ? "Verifying..." : "Verify Code"}
                </Button>
              </form>

              <div className="text-center space-y-4">
                {timeLeft > 0 ? (
                  <p className="text-sm text-gray-600">
                    Code expires in <span className="font-medium text-orange-600">{formatTime(timeLeft)}</span>
                  </p>
                ) : (
                  <p className="text-sm text-red-600 font-medium">
                    Verification code has expired
                  </p>
                )}

                <Button
                  variant="outline"
                  onClick={handleResend}
                  disabled={!canResend || isResending}
                  className="w-full"
                >
                  {isResending ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Resending...
                    </>
                  ) : (
                    `Resend Code via ${method === 'email' ? 'Email' : 'SMS'}`
                  )}
                </Button>
              </div>

              <div className="text-center">
                <p className="text-xs text-gray-500">
                  Didn't receive the code? Check your spam folder or try resending.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Verify;