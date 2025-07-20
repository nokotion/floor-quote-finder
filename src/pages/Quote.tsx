
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { CheckCircle, MapPin, Package, Tag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { validateAndFormatPhone } from "@/utils/phoneValidation";
import { VerificationModal } from "@/components/VerificationModal";

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
  const [notes, setNotes] = useState("");
  const [attachmentUrls, setAttachmentUrls] = useState<string[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionProgress, setSubmissionProgress] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [pendingQuoteData, setPendingQuoteData] = useState<any>(null);

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

  const uploadAttachments = async (files: FileList, leadId: string) => {
    const urls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const filePath = `customer-uploads/${leadId}/${file.name}`;
      
      try {
        const { data, error } = await supabase.storage
          .from('pricemyfloor-files')
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
        setSubmissionProgress((prev) => prev + (10 / files.length));
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

    // Store quote data temporarily and show verification modal
    const files = (document.getElementById('attachment') as HTMLInputElement)?.files;
    const quoteData = {
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      postal_code: addressData.postal_code,
      street_address: addressData.street,
      square_footage: parseInt(size || "0"),
      brand_requested: brand,
      notes: notes,
      address_formatted: addressData.formatted_address,
      address_city: addressData.city,
      address_province: addressData.province,
      files: files
    };

    setPendingQuoteData(quoteData);
    setShowVerificationModal(true);
  };

  const handleVerificationSuccess = async () => {
    if (!pendingQuoteData) return;

    setIsSubmitting(true);
    setSubmissionProgress(10);

    try {
      // 1. Create Lead Record
      const { data: leadData, error: leadError } = await supabase
        .from('leads')
        .insert([
          {
            customer_name: pendingQuoteData.customer_name,
            customer_email: pendingQuoteData.customer_email,
            customer_phone: pendingQuoteData.customer_phone,
            postal_code: pendingQuoteData.postal_code,
            street_address: pendingQuoteData.street_address,
            square_footage: pendingQuoteData.square_footage,
            brand_requested: pendingQuoteData.brand_requested,
            notes: pendingQuoteData.notes,
            address_formatted: pendingQuoteData.address_formatted,
            address_city: pendingQuoteData.address_city,
            address_province: pendingQuoteData.address_province,
            is_verified: true,
            status: 'verified'
          }
        ])
        .select()
        .single();

      if (leadError) {
        console.error("Lead creation error:", leadError);
        throw leadError;
      }

      setSubmissionProgress(40);

      // 2. Upload Attachments
      if (pendingQuoteData.files && pendingQuoteData.files.length > 0) {
        const uploadedUrls = await uploadAttachments(pendingQuoteData.files, leadData.id);
        setAttachmentUrls(uploadedUrls);
        
        // Update lead with attachments
        const { error: updateError } = await supabase
          .from('leads')
          .update({ attachment_urls: uploadedUrls })
          .eq('id', leadData.id);

        if (updateError) {
          console.error("Attachment update error:", updateError);
          throw updateError;
        }
      }
      setSubmissionProgress(80);

      // 3. Distribute Lead to Retailers
      const { data: distributionData, error: distributionError } = await supabase.functions.invoke('process-lead-submission', {
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
      setIsVerified(true);

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
                Complete Your Quote Request
              </CardTitle>
              <p className="text-gray-600 mt-2">
                We'll send your request to qualified retailers in your area
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Display Selected Options */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
                  <Package className="w-4 h-4 mr-2" />
                  Your Selection
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  <div className="flex items-center">
                    <Tag className="w-4 h-4 mr-2 text-blue-600" />
                    <div>
                      <span className="text-gray-600">Brand:</span>
                      <div className="font-medium">{brand}</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Package className="w-4 h-4 mr-2 text-blue-600" />
                    <div>
                      <span className="text-gray-600">Size:</span>
                      <div className="font-medium">{size} sq ft</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                    <div>
                      <span className="text-gray-600">Location:</span>
                      <div className="font-medium">
                        {formatted_address || `${city}, ${province} ${postal}`}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

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
                  <h2 className="text-3xl font-bold mb-4">Quote Submitted Successfully!</h2>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Your verified quote request has been sent to qualified retailers in your area. 
                    You should receive responses within 24 hours.
                  </p>
                  <p className="text-sm text-gray-500">
                    Thank you for using PriceMyFloor!
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
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
                    <Label htmlFor="email">Email Address *</Label>
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
                    <Label htmlFor="phone">Phone Number *</Label>
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
                    <Label htmlFor="notes">
                      Additional Notes (Optional)
                    </Label>
                    <Input
                      id="notes"
                      placeholder="Anything else we should know about your project?"
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
                    Get My Competitive Quotes
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <VerificationModal
        open={showVerificationModal}
        onOpenChange={setShowVerificationModal}
        email={customerEmail}
        phone={customerPhone}
        onVerificationSuccess={handleVerificationSuccess}
      />
    </div>
  );
};

export default Quote;
