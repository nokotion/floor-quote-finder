
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";
import { CheckCircle, MapPin, Package, Tag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { validateAndFormatPhone } from "@/utils/phoneValidation";
// Removed VerificationModal import - now using direct secure submission
import { validatePostalCode } from "@/utils/postalCodeUtils";

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
  const formatted_address = searchParams.get('formatted');

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [addressData, setAddressData] = useState<AddressData>({
    postal_code: postal || "",
    formatted_address: formatted_address || ""
  });
  const [notes, setNotes] = useState("");
  const [installationRequired, setInstallationRequired] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionProgress, setSubmissionProgress] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  // Removed verification modal state - now using direct secure submission

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

  const getValidatedPostalCode = () => {
    // Try multiple sources for postal code
    const possiblePostalCodes = [
      addressData.postal_code,
      postal,
      // Extract from formatted address if available
      addressData.formatted_address?.match(/[A-Z]\d[A-Z]\s*\d[A-Z]\d/)?.[0]
    ].filter(Boolean);

    for (const postalCode of possiblePostalCodes) {
      if (postalCode && validatePostalCode(postalCode)) {
        return postalCode.toUpperCase();
      }
    }

    return null;
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

    // Validate postal code
    const validPostalCode = getValidatedPostalCode();
    if (!validPostalCode) {
      toast({
        title: "Invalid Postal Code",
        description: "Please ensure you have a valid Canadian postal code.",
        variant: "destructive",
      });
      return;
    }

    // Validate brand selection
    if (!brand) {
      toast({
        title: "Brand Selection Required",
        description: "Please ensure a brand is selected.",
        variant: "destructive",
      });
      return;
    }

    // Submit lead through secure handler
    setIsSubmitting(true);
    setSubmissionProgress(25);

    try {
      // Prepare secure submission data
      const secureData = {
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        postal_code: validPostalCode,
        brand_requested: brand,
        project_size: size || '',
        installation_required: installationRequired,
        notes: notes
      };

      // Submit through secure edge function
      const { data: result, error: submitError } = await supabase.functions.invoke('secure-lead-handler', {
        body: secureData
      });

      if (submitError) {
        console.error('Error submitting lead:', submitError);
        throw new Error(submitError.message || 'Failed to submit lead');
      }

      setSubmissionProgress(100);
      setIsSubmitted(true);
      
      toast({
        title: "Quote request submitted!",
        description: result.message || "Please check your email to verify your request.",
      });

    } catch (error: any) {
      console.error("Secure submission error:", error);
      toast({
        title: "Submission Failed",
        description: error.message || "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Remove the verification success handler as we now handle everything in submit

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
          className="w-full max-w-4xl"
        >
          <Card className="shadow-xl border-0 bg-white">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">
                Complete Your Quote Request
              </CardTitle>
              <p className="text-gray-600 mt-2">
                We'll send your request to qualified retailers in your area
              </p>
            </CardHeader>

            <CardContent className="p-4">
              {/* Your Selection - Prefilled Data Display */}
              <Card className="shadow-xl border-0 bg-white mb-6">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <Package className="w-4 h-4 mr-2" />
                    Your Selection
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <Label className="text-sm font-semibold text-gray-800 mb-2 block">
                        Preferred Brand
                      </Label>
                      <div className="h-12 px-3 py-2 bg-gray-100 border border-gray-200 rounded-md flex items-center font-medium text-gray-900">
                        <Tag className="w-4 h-4 mr-2 text-orange-600" />
                        {brand}
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold text-gray-800 mb-2 block">
                        Project Size (sq ft)
                      </Label>
                      <div className="h-12 px-3 py-2 bg-gray-100 border border-gray-200 rounded-md flex items-center font-medium text-gray-900">
                        <Package className="w-4 h-4 mr-2 text-orange-600" />
                        {size}
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold text-gray-800 mb-2 block">
                        Address
                      </Label>
                      <div className="h-12 px-3 py-2 bg-gray-100 border border-gray-200 rounded-md flex items-center font-medium text-gray-900">
                        <MapPin className="w-4 h-4 mr-2 text-orange-600" />
                        <div className="truncate">
                          {formatted_address || postal}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

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
                  <h2 className="text-3xl font-bold mb-4">Quote Request Submitted!</h2>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Please check your email to verify your request. Once verified, we'll match you with qualified retailers in your area.
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
                      className="h-12 text-base focus:ring-2 focus:ring-orange-500 focus:border-orange-500 border-gray-200 font-medium"
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
                      className="h-12 text-base focus:ring-2 focus:ring-orange-500 focus:border-orange-500 border-gray-200 font-medium"
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
                      className="h-12 text-base focus:ring-2 focus:ring-orange-500 focus:border-orange-500 border-gray-200 font-medium"
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
                      className="h-12 text-base focus:ring-2 focus:ring-orange-500 focus:border-orange-500 border-gray-200 font-medium"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="installation"
                      checked={installationRequired}
                      onCheckedChange={(checked) => setInstallationRequired(checked as boolean)}
                    />
                    <Label htmlFor="installation" className="text-sm font-normal">
                      I require professional installation
                    </Label>
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
                      className="cursor-pointer h-12 text-base focus:ring-2 focus:ring-orange-500 focus:border-orange-500 border-gray-200"
                    />
                    <p className="text-gray-500 text-sm mt-1">
                      Upload photos of the space for more accurate quotes.
                    </p>
                  </div>

                  <div className="text-center pt-2">
                    <Button 
                      type="submit" 
                      size="lg" 
                      disabled={isSubmitting}
                      className="px-10 py-4 text-base font-semibold bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:opacity-50 transition-all duration-300 shadow-lg transform hover:scale-105 hover:shadow-xl"
                    >
                      Get My Competitive Quotes
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Removed VerificationModal - now using direct secure submission */}
    </div>
  );
};

export default Quote;
