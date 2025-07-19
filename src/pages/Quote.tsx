import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { CheckCircle, Mail, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { validateAndFormatPhone } from "@/utils/phoneValidation";

interface AddressData {
  street?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  formatted_address?: string;
}

const Quote = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const brand = searchParams.get('brand');
  const size = searchParams.get('size');
  const postal = searchParams.get('postal');
  const street = searchParams.get('street');
  const city = searchParams.get('city');
  const province = searchParams.get('province');
  const formatted_address = searchParams.get('formatted_address');

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [addressData, setAddressData] = useState<AddressData>({
    street: street || "",
    city: city || "",
    province: province || "",
    postal_code: postal || "",
    formatted_address: formatted_address || ""
  });
  const [budget, setBudget] = useState("");
  const [timeline, setTimeline] = useState("");
  const [installation, setInstallation] = useState(false);
  const [notes, setNotes] = useState("");
  const [attachmentUrls, setAttachmentUrls] = useState<string[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionProgress, setSubmissionProgress] = useState(0);
  const [leadId, setLeadId] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  useEffect(() => {
    // Basic validation for initial quote parameters
    if (!brand || !size || !postal) {
      toast({
        title: "Missing Information",
        description: "Please fill out all fields in the quick quote form.",
        variant: "destructive",
      });
      navigate('/', { replace: true });
    }
  }, [brand, size, postal, navigate, toast]);

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleEmailChange = (email: string) => {
    setCustomerEmail(email);
    if (email && !validateEmail(email)) {
      setEmailError("Please enter a valid email address.");
    } else {
      setEmailError("");
    }
  };

  const handlePhoneChange = (phone: string) => {
    setCustomerPhone(phone);
    setPhoneError(""); // Clear previous errors
  };

  const handlePhoneBlur = () => {
    if (customerPhone) {
      const validationResult = validateAndFormatPhone(customerPhone, true);
      if (!validationResult.isValid) {
        setPhoneError(validationResult.error || "Invalid phone number");
      } else {
        setCustomerPhone(validationResult.formatted || customerPhone);
        setPhoneError("");
      }
    }
  };

  const uploadAttachments = async (files: FileList) => {
    const urls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const filePath = `customer-uploads/${leadId}/${file.name}`;
      
      try {
        const { data, error } = await supabase.storage
          .from('customer-photos')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) {
          console.error("Error uploading file:", error);
          toast({
            title: "Upload Failed",
            description: `Failed to upload ${file.name}. Please try again.`,
            variant: "destructive",
          });
          continue;
        }

        const url = `https://syjxtyvsencbmhuprnyu.supabase.co/storage/v1/object/public/pricemyfloor-files/${data.path}`;
        urls.push(url);
        setSubmissionProgress((prev) => prev + (100 / files.length));
      } catch (uploadError: any) {
        console.error("Unexpected error during upload:", uploadError);
        toast({
          title: "Upload Error",
          description: `An unexpected error occurred while uploading ${file.name}.`,
          variant: "destructive",
        });
      }
    }
    return urls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName || !customerEmail || !customerPhone) {
      toast({
        title: "Missing Information",
        description: "Please fill out all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (emailError) {
      toast({
        title: "Invalid Email",
        description: emailError,
        variant: "destructive",
      });
      return;
    }

    if (phoneError) {
      toast({
        title: "Invalid Phone",
        description: phoneError,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    setSubmissionProgress(10);

    try {
      // 1. Create Lead Record
      const { data: leadData, error: leadError } = await supabase
        .from('leads')
        .insert([
          {
            customer_name: customerName,
            customer_email: customerEmail,
            customer_phone: customerPhone,
            postal_code: addressData.postal_code,
            street_address: addressData.street,
            square_footage: parseInt(size || "0"),
            brand_requested: brand,
            budget_range: budget,
            installation_required: installation,
            timeline: timeline,
            notes: notes,
            address_formatted: addressData.formatted_address,
            address_city: addressData.city,
            address_province: addressData.province
          }
        ])
        .select()
        .single();

      if (leadError) {
        console.error("Lead creation error:", leadError);
        throw leadError;
      }

      setLeadId(leadData.id);
      setSubmissionProgress(20);

      // 2. Upload Attachments
      const files = (document.getElementById('attachment') as HTMLInputElement)?.files;
      if (files && files.length > 0) {
        const uploadedUrls = await uploadAttachments(files);
        setAttachmentUrls(uploadedUrls);
        setSubmissionProgress(80);
      }

      // 3. Update Lead Record with Attachments and Finalize
      const { error: updateError } = await supabase
        .from('leads')
        .update({ attachment_urls: attachmentUrls })
        .eq('id', leadData.id);

      if (updateError) {
        console.error("Attachment update error:", updateError);
        throw updateError;
      }
      setSubmissionProgress(90);

      // 4. Distribute Lead to Retailers
      const { data: distributionData, error: distributionError } = await supabase.functions.invoke('distribute-lead', {
        body: { leadId: leadData.id },
      });

      if (distributionError) {
        console.error("Lead distribution error:", distributionError);
        throw distributionError;
      }

      if (distributionData.success) {
        console.log('Lead distributed successfully:', distributionData.message);
      } else {
        console.warn('Lead distribution failed:', distributionData.error);
        toast({
          title: "Warning",
          description: distributionData.error || "Failed to distribute lead to retailers.",
          variant: "destructive",
        });
      }
      setSubmissionProgress(100);
      setIsSubmitted(true);

    } catch (error: any) {
      console.error("Submission error:", error);
      toast({
        title: "Submission Failed",
        description: error.message || "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerificationSend = async (method: 'email' | 'sms', contact: string) => {
    if (!leadId) {
      toast({
        title: "Error",
        description: "Quote submission not found. Please try again.",
        variant: "destructive",
      });
      return;
    }

    console.log(`Sending ${method} verification to ${contact} for lead ${leadId}`);
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('send-verification', {
        body: {
          leadId,
          method,
          contact,
        },
      });

      console.log('Verification response:', data);

      if (error) {
        console.error('Verification error:', error);
        throw error;
      }

      if (data.success) {
        // Check for partial failure
        if (data.partialFailure) {
          toast({
            title: "Verification Sent with Warning",
            description: data.message,
            variant: "default",
          });
        } else {
          toast({
            title: "Verification Sent",
            description: data.message,
          });
        }

        // Navigate to verification page
        const verifyParams = new URLSearchParams({
          leadId,
          method,
          contact,
        });
        navigate(`/verify?${verifyParams.toString()}`);
      } else {
        // Handle specific error types
        const errorMessage = data.error || 'Failed to send verification';
        const errorDetails = data.details || 'Please try again';
        
        console.error('Verification failed:', {
          error: data.error,
          details: data.details,
          errorType: data.errorType
        });

        // Show specific error messages based on error type
        if (data.errorType === 'VERIFICATION_SEND_FAILED') {
          toast({
            title: "Verification Failed",
            description: `${errorMessage}. ${errorDetails}`,
            variant: "destructive",
          });
        } else if (data.errorType === 'DATABASE_UPDATE_FAILED') {
          toast({
            title: "System Warning",
            description: data.warning || errorDetails,
            variant: "default",
          });
        } else {
          toast({
            title: "Verification Error",
            description: `${errorMessage}. ${errorDetails}`,
            variant: "destructive",
          });
        }
      }
    } catch (error: any) {
      console.error('Network error during verification:', error);
      
      let errorMessage = 'Failed to send verification code';
      let errorDescription = 'Please check your connection and try again';
      
      // Handle specific error types
      if (error.message) {
        if (error.message.includes('Phone number')) {
          errorDescription = 'Please check your phone number format and try again';
        } else if (error.message.includes('Email')) {
          errorDescription = 'Please check your email address and try again';
        } else if (error.message.includes('trial')) {
          errorDescription = 'SMS verification is currently limited. Please try email verification instead';
        }
      }

      toast({
        title: errorMessage,
        description: errorDescription,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center">
              <img
                src="https://syjxtyvsencbmhuprnyu.supabase.co/storage/v1/object/public/pricemyfloor-files//pricemyfloor%20_logo.png"
                alt="Price My Floor Logo"
                className="h-12 w-auto"
              />
            </Link>
          </div>
        </div>
      </div>

      {/* Quote Form */}
      <div className="flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-2xl"
        >
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">
                Almost there!
              </CardTitle>
              <p className="text-gray-600 mt-2">
                Please provide your contact information to receive your personalized quotes.
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {isSubmitting ? (
                <div className="text-center">
                  <p className="text-lg text-gray-700 mb-4">Submitting your request...</p>
                  <Progress value={submissionProgress} className="h-2" />
                  <p className="text-sm text-gray-500 mt-2">
                    {submissionProgress < 100 ? `Please wait, this may take a moment.` : `Finalizing...`}
                  </p>
                </div>
              ) : isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="text-center py-12"
                >
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                  <h2 className="text-3xl font-bold mb-4">Submission Received!</h2>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    To ensure you're a real person, please verify your{" "}
                    {customerEmail && validateEmail(customerEmail) ? (
                      <>
                        <Button variant="link" onClick={() => handleVerificationSend('email', customerEmail)}>
                          email
                        </Button>{" "}
                        or
                      </>
                    ) : null}{" "}
                    <Button variant="link" onClick={() => handleVerificationSend('sms', customerPhone)}>
                      phone
                    </Button>
                    .
                  </p>
                  <p className="text-sm text-gray-500">
                    We'll connect you with verified retailers shortly.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john.doe@example.com"
                      value={customerEmail}
                      onChange={(e) => handleEmailChange(e.target.value)}
                      required
                    />
                    {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      value={customerPhone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      onBlur={handlePhoneBlur}
                      required
                    />
                    {phoneError && <p className="text-red-500 text-sm mt-1">{phoneError}</p>}
                  </div>

                  <div>
                    <Label htmlFor="budget">
                      What's your budget for this project? (Optional)
                    </Label>
                    <Select value={budget} onValueChange={setBudget}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select budget range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="$500 - $1,000">$500 - $1,000</SelectItem>
                        <SelectItem value="$1,000 - $3,000">$1,000 - $3,000</SelectItem>
                        <SelectItem value="$3,000 - $5,000">$3,000 - $5,000</SelectItem>
                        <SelectItem value="$5,000+">$5,000+</SelectItem>
                        <SelectItem value="Not sure">Not sure</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="timeline">
                      When are you looking to start this project? (Optional)
                    </Label>
                    <Select value={timeline} onValueChange={setTimeline}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select timeline" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Within 1-2 weeks">Within 1-2 weeks</SelectItem>
                        <SelectItem value="Within the next month">Within the next month</SelectItem>
                        <SelectItem value="Within 2-3 months">Within 2-3 months</SelectItem>
                        <SelectItem value="Not sure">Not sure</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="installation" className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="installation"
                        checked={installation}
                        onChange={(e) => setInstallation(e.target.checked)}
                        className="w-4 h-4"
                      />
                      <span>Do you require installation services?</span>
                    </Label>
                  </div>

                  <div>
                    <Label htmlFor="notes">
                      Additional Notes (Optional)
                    </Label>
                    <Input
                      id="notes"
                      placeholder="Anything else we should know?"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="attachment">
                      Upload Photos (Optional)
                    </Label>
                    <Input
                      type="file"
                      id="attachment"
                      multiple
                      accept="image/*"
                      className="cursor-pointer"
                    />
                    <p className="text-gray-500 text-sm mt-1">
                      Upload photos of the space for more accurate quotes.
                    </p>
                  </div>

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    Submit Request
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Quote;
