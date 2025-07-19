import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Check, Upload, X, File } from "lucide-react";
import sampleFlooringImage from "@/assets/sample-flooring.jpg";
import { formatAndValidatePostalCode, validatePostalCode } from "@/utils/postalCodeUtils";
import { supabase } from "@/integrations/supabase/client";
import { projectSizes } from "@/constants/flooringData";
import AddressAutocomplete, { AddressData } from "@/components/ui/address-autocomplete";
import { validateAndFormatPhone, formatPhoneDisplay } from "@/utils/phoneValidation";
import { toast } from "sonner";

interface QuoteFormData {
  brandRequested: string;
  squareFootage: number;
  installationRequired: boolean;
  postalCode: string;
  timeline: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  streetAddress: string;
  notes: string;
  attachmentUrls: string[];
}

interface Brand {
  id: string;
  name: string;
}

interface PrefilledValues {
  brand?: string;
  size?: string;
  postal?: string;
  street?: string;
  city?: string;
  province?: string;
  formatted_address?: string;
}

const Quote = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [prefilledValues, setPrefilledValues] = useState<PrefilledValues>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [postalCodeError, setPostalCodeError] = useState("");
  const [brands, setBrands] = useState<Brand[]>([]);
  const [verificationMethod, setVerificationMethod] = useState<'email' | 'sms'>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<QuoteFormData>({
    brandRequested: '',
    squareFootage: 0,
    installationRequired: false,
    postalCode: '',
    timeline: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    streetAddress: '',
    notes: '',
    attachmentUrls: []
  });
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [phoneError, setPhoneError] = useState<string>('');

  // Fetch brands from database
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const { data, error } = await supabase
          .from('flooring_brands')
          .select('id, name')
          .order('name');
        
        if (error) throw error;
        setBrands(data || []);
      } catch (error) {
        console.error('Error fetching brands:', error);
      }
    };

    fetchBrands();
  }, []);

  // Handle URL parameter pre-filling - run after brands are loaded
  useEffect(() => {
    if (brands.length === 0) return; // Wait for brands to load

    const brandParam = searchParams.get('brand');
    const sizeParam = searchParams.get('size');
    const postalParam = searchParams.get('postal');
    const streetParam = searchParams.get('street');
    const cityParam = searchParams.get('city');
    const provinceParam = searchParams.get('province');
    const formattedAddressParam = searchParams.get('formatted_address');

    const prefilled: PrefilledValues = {};

    if (brandParam) {
      prefilled.brand = brandParam;
      setFormData(prev => ({
        ...prev,
        brandRequested: brandParam
      }));
    }

    if (sizeParam) {
      prefilled.size = projectSizes.find(p => p.value === sizeParam)?.label || sizeParam;
      setFormData(prev => ({
        ...prev,
        squareFootage: parseSquareFootage(sizeParam)
      }));
    }

    if (postalParam) {
      prefilled.postal = postalParam;
      setFormData(prev => ({
        ...prev,
        postalCode: postalParam
      }));
    }

    // Store address components for later use
    if (streetParam) prefilled.street = streetParam;
    if (cityParam) prefilled.city = cityParam;
    if (provinceParam) prefilled.province = provinceParam;
    if (formattedAddressParam) prefilled.formatted_address = formattedAddressParam;

    // Pre-fill address from Google Places selection
    if (formattedAddressParam) {
      setFormData(prev => ({
        ...prev,
        streetAddress: formattedAddressParam
      }));
    } else if (streetParam && cityParam && provinceParam) {
      const baseAddress = `${streetParam}, ${cityParam}, ${provinceParam}`;
      setFormData(prev => ({
        ...prev,
        streetAddress: baseAddress
      }));
    }

    setPrefilledValues(prefilled);
  }, [searchParams, brands]);

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddressChange = (address: string, addressData?: AddressData) => {
    if (addressData) {
      // Use postal code from Google Places if available
      if (addressData.postal_code) {
        updateFormData('postalCode', addressData.postal_code);
        setPostalCodeError("");
      }
      // Set full address
      updateFormData('streetAddress', addressData.formatted_address);
    } else {
      // Manual input - treat as postal code if it looks like one
      const trimmed = address.trim();
      if (/^[A-Za-z]\d[A-Za-z][\s-]?\d[A-Za-z]\d$/.test(trimmed.replace(/\s+/g, ' '))) {
        const formatted = formatAndValidatePostalCode(trimmed, formData.postalCode);
        updateFormData('postalCode', formatted);
        if (postalCodeError) setPostalCodeError("");
      } else {
        updateFormData('streetAddress', trimmed);
      }
    }
  };

  const handleAddressBlur = () => {
    if (formData.postalCode && !validatePostalCode(formData.postalCode)) {
      setPostalCodeError("Please enter a valid Canadian postal code (e.g., M5V 3A8)");
    } else {
      setPostalCodeError("");
    }
  };

  const handleFileUpload = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isPdf = file.type === 'application/pdf';
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
      return (isImage || isPdf) && isValidSize;
    });

    if (validFiles.length === 0) {
      alert('Please select valid image files (JPG, PNG, GIF) or PDF files under 10MB.');
      return;
    }

    setIsUploading(true);
    const newUrls: string[] = [];

    try {
      for (const file of validFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `lead-attachments/${fileName}`;

        const { data, error } = await supabase.storage
          .from('pricemyfloor-files')
          .upload(filePath, file);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('pricemyfloor-files')
          .getPublicUrl(data.path);

        newUrls.push(publicUrl);
      }

      setUploadedFiles(prev => [...prev, ...validFiles]);
      updateFormData('attachmentUrls', [...formData.attachmentUrls, ...newUrls]);
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Error uploading files. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    const newUrls = formData.attachmentUrls.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    updateFormData('attachmentUrls', newUrls);
  };

  const handlePhoneChange = (value: string) => {
    updateFormData('customerPhone', value);
    // Use lenient validation during typing to avoid red errors on valid numbers
    if (verificationMethod === 'sms' && value.trim() !== '') {
      const validation = validateAndFormatPhone(value, false);
      setPhoneError(validation.isValid ? '' : validation.error || 'Invalid phone number');
    } else {
      setPhoneError('');
    }
  };

  const handlePhoneBlur = () => {
    if (verificationMethod === 'sms' && formData.customerPhone) {
      const validation = validateAndFormatPhone(formData.customerPhone, true);
      setPhoneError(validation.isValid ? '' : validation.error || 'Invalid phone number');
    }
  };

  const isFormValid = () => {
    const requiredFields = [
      'brandRequested',
      'customerName', 
      'customerEmail',
      'postalCode',
      'timeline'
    ];
    
    const hasRequiredFields = requiredFields.every(field => 
      formData[field as keyof QuoteFormData] && 
      String(formData[field as keyof QuoteFormData]).trim() !== ""
    );
    
    const hasValidPostalCode = formData.postalCode && validatePostalCode(formData.postalCode);
    const hasSquareFootage = formData.squareFootage > 0;
    
    // For SMS verification, validate phone number properly with strict validation
    let hasValidPhone = true;
    if (verificationMethod === 'sms') {
      if (!formData.customerPhone || formData.customerPhone.trim() === '') {
        hasValidPhone = false;
      } else {
        const phoneValidation = validateAndFormatPhone(formData.customerPhone, true);
        hasValidPhone = phoneValidation.isValid;
      }
    }
    
    return hasRequiredFields && hasValidPostalCode && hasSquareFootage && hasValidPhone;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.postalCode && !validatePostalCode(formData.postalCode)) {
      setPostalCodeError("Please enter a valid Canadian postal code (e.g., M5V 3A8)");
      return;
    }

    console.log('Form validation check:', {
      isFormValid: isFormValid(),
      formData,
      verificationMethod,
      requiredFields: {
        brandRequested: formData.brandRequested,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        postalCode: formData.postalCode,
        timeline: formData.timeline,
        squareFootage: formData.squareFootage,
        customerPhone: formData.customerPhone
      }
    });
    
    if (!isFormValid()) {
      console.error('Form validation failed');
      alert('Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    try {
      // Format phone number if SMS verification is chosen
      let formattedPhone = formData.customerPhone;
      if (verificationMethod === 'sms' && formData.customerPhone) {
        const phoneValidation = validateAndFormatPhone(formData.customerPhone);
        if (!phoneValidation.isValid) {
          throw new Error(phoneValidation.error || 'Invalid phone number');
        }
        formattedPhone = phoneValidation.formatted;
      }
      
      // Simplify phone handling for debugging
      const debugPhone = formData.customerPhone || null;
      console.log("Raw phone input:", formData.customerPhone);
      console.log("Debug phone output:", debugPhone);
      
      const leadInsertData = {
        customer_name: formData.customerName,
        customer_email: formData.customerEmail,
        customer_phone: debugPhone,
        postal_code: formData.postalCode,
        street_address: formData.streetAddress,
        brand_requested: formData.brandRequested,
        square_footage: formData.squareFootage,
        project_type: null,
        installation_required: formData.installationRequired,
        timeline: formData.timeline,
        notes: formData.notes,
        attachment_urls: formData.attachmentUrls,
        status: 'pending_verification',
        is_verified: false,
        verification_method: verificationMethod
      };
      
      // DEBUGGING: Log complete payload and RLS validation
      console.log("=== DEBUGGING LEAD INSERT ===");
      console.log("Complete leadInsertData:", leadInsertData);
      
      // Check each RLS policy requirement individually
      console.log("RLS Policy Validation:");
      console.log("✓ customer_name:", leadInsertData.customer_name, "IS NOT NULL?", leadInsertData.customer_name !== null && leadInsertData.customer_name !== undefined && leadInsertData.customer_name !== "");
      console.log("✓ customer_email:", leadInsertData.customer_email, "IS NOT NULL?", leadInsertData.customer_email !== null && leadInsertData.customer_email !== undefined && leadInsertData.customer_email !== "");
      console.log("✓ postal_code:", leadInsertData.postal_code, "IS NOT NULL?", leadInsertData.postal_code !== null && leadInsertData.postal_code !== undefined && leadInsertData.postal_code !== "");
      console.log("✓ status:", leadInsertData.status, "= 'pending_verification'?", leadInsertData.status === 'pending_verification');
      
      // Pre-insert validation
      const rlsValidation = {
        customer_name_valid: leadInsertData.customer_name !== null && leadInsertData.customer_name !== undefined && leadInsertData.customer_name !== "",
        customer_email_valid: leadInsertData.customer_email !== null && leadInsertData.customer_email !== undefined && leadInsertData.customer_email !== "",
        postal_code_valid: leadInsertData.postal_code !== null && leadInsertData.postal_code !== undefined && leadInsertData.postal_code !== "",
        status_valid: leadInsertData.status === 'pending_verification'
      };
      
      console.log("RLS Requirements Met:", rlsValidation);
      const allRlsValid = Object.values(rlsValidation).every(Boolean);
      console.log("ALL RLS REQUIREMENTS MET?", allRlsValid);
      
      if (!allRlsValid) {
        console.error("RLS validation failed before insert attempt!");
        alert("Form validation error - missing required fields for database security policy");
        return;
      }
      
      // Save the lead to database with pending verification status
      console.log("=== ATTEMPTING LEAD INSERTION ===");
      console.log("Direct payload:", leadInsertData);
      
      // Use full payload instead of simplified one to ensure all required fields are present
      console.log("Using complete payload for insertion");
      
      const { data: leadData, error: leadError } = await supabase
        .from('leads')
        .insert(leadInsertData)
        .select()
        .single();

      if (leadError) {
        console.error("=== SUPABASE INSERT ERROR ===");
        console.error("Full Supabase error object:", leadError);
        console.error("Error message:", leadError.message);
        console.error("Error details:", leadError.details);
        console.error("Error hint:", leadError.hint);
        console.error("Error code:", leadError.code);
        console.error("Insert payload was:", leadInsertData);
        
        // Advanced error diagnostics for RLS issues
        if (leadError.code === '42501' || leadError.message?.includes('policy')) {
          console.error("RLS POLICY VIOLATION DETECTED!");
          
          // Check if it might be an auth issue
          const { data: { session } } = await supabase.auth.getSession();
          console.log("Current auth session:", session);
          console.log("Is user authenticated?", !!session?.user);
          
          // Verify the universal policy requirements
          console.log("Universal policy requirements check:");
          console.log("Policy name: 'Universal lead insertion policy'");
          console.log("Required fields validation:");
          console.log("- customer_name valid:", rlsValidation.customer_name_valid);
          console.log("- customer_email valid:", rlsValidation.customer_email_valid);
          console.log("- postal_code valid:", rlsValidation.postal_code_valid);
          console.log("- status = 'pending_verification':", rlsValidation.status_valid);
          
          alert("Quote submission failed due to security policy. Please ensure all required fields are filled correctly and try again.");
          return;
        }
        
        // Show the actual Supabase error instead of generic message
        alert(`Database error: ${leadError.message || 'Unexpected error during quote submission.'}`);
        return;
      }

      console.log('Lead saved for verification:', leadData);

      // Send verification code
      const contact = verificationMethod === 'email' ? formData.customerEmail : formattedPhone;
      console.log(`=== SENDING ${verificationMethod.toUpperCase()} VERIFICATION ===`);
      console.log(`Lead ID: ${leadData.id}`);
      console.log(`Contact: ${contact}`);
      console.log(`Method: ${verificationMethod}`);
      
      console.log('Calling send-verification function...');
      const { data: verificationResult, error: verificationError } = await supabase.functions.invoke('send-verification', {
        body: {
          leadId: leadData.id,
          method: verificationMethod,
          contact: contact
        }
      });

      console.log('=== VERIFICATION FUNCTION RESPONSE ===');
      console.log('Result:', verificationResult);
      console.log('Error:', verificationError);
      console.log('Error details:', verificationError?.details);
      console.log('Error message:', verificationError?.message);

      // Handle verification response more intelligently
      if (verificationError) {
        console.error('Error sending verification:', verificationError);
        
        // Check if it's a network error vs API error
        if (verificationError.message?.includes('fetch')) {
          alert('Network error sending verification code. Please check your connection and try again.');
        } else if (verificationError.message?.includes('trial mode')) {
          alert('SMS verification failed: This phone number needs to be verified in Twilio for trial accounts. Please try email verification instead or contact support.');
        } else if (verificationError.message?.includes('domain')) {
          alert('Email verification failed: Email domain not verified. Please try SMS verification instead or contact support.');
        } else {
          alert(`Error sending verification code: ${verificationError.message}`);
        }
        return;
      }

      // Check if we have a successful result
      if (verificationResult && verificationResult.success) {
        console.log('Verification sent successfully:', verificationResult);
        
        // Handle partial failures gracefully
        if (verificationResult.partialFailure) {
          console.warn('Partial failure detected:', verificationResult.warning);
          // Show a toast warning but still proceed
          alert(`${verificationResult.message}. ${verificationResult.warning || ''}`);
        }
      } else {
        console.warn('Unexpected verification response format:', verificationResult);
        // Don't fail here - the verification might still have been sent
      }

      // Redirect to verification page
      const params = new URLSearchParams({
        leadId: leadData.id,
        method: verificationMethod,
        contact: contact
      });
      
      navigate(`/verify?${params.toString()}`);
    } catch (error) {
      console.error('Error submitting quote:', error);
      alert('Error submitting quote. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to parse square footage
  const parseSquareFootage = (sizeString: string): number => {
    // Extract the first number from the size range
    const sizeMap: { [key: string]: number } = {
      '0-100': 50,
      '100-500': 300,
      '500-1000': 750,
      '1000-5000': 3000,
      '5000+': 7500
    };
    return sizeMap[sizeString] || 500;
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
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
              <h2 className="text-2xl font-semibold mb-4">Quote Submitted Successfully!</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                We've sent a verification code to {formData.customerEmail}. Please check your email to verify your request.
              </p>
              <Button
                onClick={() => navigate('/verify')}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              >
                Verify Email Now
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-6xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Complete Your Quote Request</h1>
            <p className="text-xl text-gray-600">Get personalized quotes from qualified retailers</p>
          </div>

          {/* Pre-filled Values Section */}
          {(prefilledValues.brand || prefilledValues.size || prefilledValues.formatted_address) && (
            <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Check className="w-5 h-5 text-green-600" />
                  <h2 className="text-xl font-semibold text-green-800">Your Selections So Far</h2>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  {prefilledValues.brand && (
                    <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-green-200">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="text-sm text-gray-600">Preferred Brand</p>
                        <p className="font-medium text-green-800">{prefilledValues.brand}</p>
                      </div>
                    </div>
                  )}
                  {prefilledValues.size && (
                    <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-green-200">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="text-sm text-gray-600">Project Size</p>
                        <p className="font-medium text-green-800">{prefilledValues.size}</p>
                      </div>
                    </div>
                  )}
                  {prefilledValues.formatted_address && (
                    <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-green-200">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="text-sm text-gray-600">Address</p>
                        <p className="font-medium text-green-800">{prefilledValues.formatted_address}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Missing Fields Section - Show when essential fields are not pre-filled */}
          {(!prefilledValues.brand || !prefilledValues.size || !prefilledValues.formatted_address) && (
            <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-blue-800 mb-4">Complete Your Project Details</h2>
                <div className="grid md:grid-cols-3 gap-4">
                  {!prefilledValues.brand && (
                    <div className="p-4 bg-white rounded-lg border border-blue-200">
                      <Label className="text-sm font-semibold text-gray-800 mb-2 block">
                        Preferred Brand *
                      </Label>
                      <Select 
                        value={formData.brandRequested || ""} 
                        onValueChange={(value) => updateFormData('brandRequested', value)}
                      >
                        <SelectTrigger className="h-12 text-base focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                          <SelectValue placeholder="Select brand" />
                        </SelectTrigger>
                        <SelectContent>
                          {brands.map((brand) => (
                            <SelectItem key={brand.id} value={brand.name}>
                              {brand.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {!prefilledValues.size && (
                    <div className="p-4 bg-white rounded-lg border border-blue-200">
                      <Label className="text-sm font-semibold text-gray-800 mb-2 block">
                        Project Size (sq ft) *
                      </Label>
                      <Select 
                        value={projectSizes.find(p => parseSquareFootage(p.value) === formData.squareFootage)?.value || ""} 
                        onValueChange={(value) => updateFormData('squareFootage', parseSquareFootage(value))}
                      >
                        <SelectTrigger className="h-12 text-base focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent>
                          {projectSizes.map((size) => (
                            <SelectItem key={size.value} value={size.value}>
                              {size.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="p-4 bg-white rounded-lg border border-blue-200">
                    <Label className="text-sm font-semibold text-gray-800 mb-2 block">
                      Project Address *
                    </Label>
                    <AddressAutocomplete
                      value={formData.streetAddress || formData.postalCode}
                      onChange={handleAddressChange}
                      onBlur={handleAddressBlur}
                      placeholder="Enter your address or postal code"
                      className={`h-12 text-base ${
                        postalCodeError 
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                          : 'focus:ring-2 focus:ring-orange-500 focus:border-orange-500'
                      }`}
                    />
                    {postalCodeError && (
                      <p className="text-red-500 text-sm mt-1">{postalCodeError}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Main Form - 3 Box Layout */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 3-Box Grid Layout */}
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Box 1 - Installation Required */}
                  <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm min-h-[200px] flex flex-col">
                    <Label className="text-lg font-semibold text-gray-800 mb-4 block">
                      Installation Required
                    </Label>
                    <div className="flex-1 flex flex-col justify-start">
                      <RadioGroup 
                        value={formData.installationRequired ? "yes" : "no"} 
                        onValueChange={(value) => updateFormData('installationRequired', value === "yes")}
                        className="space-y-3"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="install-yes" />
                          <Label htmlFor="install-yes" className="text-sm">Yes, I need professional installation</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="install-no" />
                          <Label htmlFor="install-no" className="text-sm">No, I'll handle installation myself</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>

                  {/* Box 2 - Timeline */}
                  <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm min-h-[200px] flex flex-col">
                    <Label className="text-lg font-semibold text-gray-800 mb-4 block">
                      Project Timeline
                    </Label>
                    <div className="flex-1 flex flex-col justify-start">
                      <Select 
                        value={formData.timeline || ""} 
                        onValueChange={(value) => updateFormData('timeline', value)}
                      >
                        <SelectTrigger className="h-12 text-base focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                          <SelectValue placeholder="When would you like to start?" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ASAP">ASAP</SelectItem>
                          <SelectItem value="In a month">In a month</SelectItem>
                          <SelectItem value="2-3 months">2-3 months</SelectItem>
                          <SelectItem value="3+ months">3+ months</SelectItem>
                          <SelectItem value="Just planning">Just planning</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                   {/* Box 3 - Contact Information */}
                   <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm min-h-[200px] flex flex-col">
                     <Label className="text-lg font-semibold text-gray-800 mb-4 block">
                       Contact Information
                     </Label>
                     <div className="flex-1 flex flex-col justify-start space-y-3">
                       <div>
                         <Label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name *</Label>
                         <Input
                           id="name"
                           type="text"
                           value={formData.customerName}
                           onChange={(e) => updateFormData('customerName', e.target.value)}
                           placeholder="Enter your full name"
                           className="h-12 text-sm"
                           required
                         />
                       </div>
                       
                       <div>
                         <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address *</Label>
                         <Input
                           id="email"
                           type="email"
                           value={formData.customerEmail}
                           onChange={(e) => updateFormData('customerEmail', e.target.value)}
                           placeholder="Enter your email"
                           className="h-12 text-sm"
                           required
                         />
                       </div>

                         <div>
                           <Label htmlFor="phone" className={`text-sm font-medium text-gray-700 ${verificationMethod === 'sms' && phoneError ? 'text-red-600' : ''}`}>
                             Phone Number {verificationMethod === 'sms' ? '*' : ''}
                           </Label>
                           <Input
                             id="phone"
                             type="tel"
                             value={formData.customerPhone || ""}
                             onChange={(e) => handlePhoneChange(e.target.value)}
                             onBlur={handlePhoneBlur}
                             placeholder="Enter your phone (e.g., 905-872-6683)"
                             className={`h-12 text-sm ${
                               verificationMethod === 'sms' && phoneError
                                 ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                                 : ''
                             }`}
                             required={verificationMethod === 'sms'}
                           />
                           {verificationMethod === 'sms' && phoneError && (
                             <p className="mt-1 text-sm text-red-600">{phoneError}</p>
                           )}
                        </div>

                       <div>
                         <Label className="text-sm font-medium text-gray-700 mb-2 block">
                           Verification Method *
                         </Label>
                         <RadioGroup
                           value={verificationMethod}
                           onValueChange={(value: 'email' | 'sms') => setVerificationMethod(value)}
                           className="flex space-x-4"
                         >
                           <div className="flex items-center space-x-2">
                             <RadioGroupItem value="email" id="verify-email" />
                             <Label htmlFor="verify-email" className="text-sm">Email</Label>
                           </div>
                           <div className="flex items-center space-x-2">
                             <RadioGroupItem value="sms" id="verify-sms" />
                             <Label htmlFor="verify-sms" className="text-sm">SMS</Label>
                           </div>
                         </RadioGroup>
                       </div>
                     </div>
                   </div>
                </div>

                {/* Additional Details Section */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
                  <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Additional Details</h3>
                    <p className="text-sm text-gray-600">Help us provide better quotes with more project details</p>
                  </div>
                  
                  <div className="p-6">
                    <div className="grid lg:grid-cols-3 gap-6">
                      {/* Project Description Section */}
                      <div className="flex flex-col h-full min-h-[400px]">
                        <div className="flex items-center space-x-2 mb-4">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-bold">1</span>
                          </div>
                          <h4 className="text-lg font-semibold text-gray-800">Project Description</h4>
                        </div>
                        
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100 flex-1 flex flex-col">
                          <Label htmlFor="description" className="text-sm font-medium text-gray-700 mb-3 block">
                            Tell us about your project
                          </Label>
                          <Textarea
                            id="description"
                            value={formData.notes}
                            onChange={(e) => updateFormData('notes', e.target.value)}
                            placeholder="Describe your project: room size, preferred style, budget range, timeline, or any special requirements..."
                            className="flex-1 min-h-[200px] text-sm resize-none border-white bg-white/70 backdrop-blur-sm focus:bg-white transition-all duration-200"
                          />
                        </div>
                      </div>
                      
                      {/* Photo Upload Section */}
                      <div className="flex flex-col h-full min-h-[400px]">
                        <div className="flex items-center space-x-2 mb-4">
                          <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-bold">2</span>
                          </div>
                          <h4 className="text-lg font-semibold text-gray-800">Upload Photos</h4>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100 flex-1 flex flex-col">
                          <Label className="text-sm font-medium text-gray-700 mb-3 block">
                            Share photos of your space
                          </Label>
                          
                          <div
                            className="border-2 border-dashed border-green-300 rounded-lg p-6 text-center hover:border-green-400 hover:bg-green-50/50 transition-all duration-200 cursor-pointer bg-white/70 backdrop-blur-sm flex-1 flex flex-col justify-center min-h-[140px]"
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                              e.preventDefault();
                              handleFileUpload(e.dataTransfer.files);
                            }}
                            onClick={() => {
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.multiple = true;
                              input.accept = 'image/*,application/pdf';
                              input.onchange = (e) => {
                                const files = (e.target as HTMLInputElement).files;
                                if (files) handleFileUpload(files);
                              };
                              input.click();
                            }}
                          >
                            {isUploading ? (
                              <div className="flex items-center justify-center space-x-2">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
                                <span className="text-sm text-gray-600">Uploading...</span>
                              </div>
                            ) : (
                              <div>
                                <Upload className="mx-auto h-10 w-10 text-green-500 mb-3" />
                                <p className="text-sm font-medium text-gray-700 mb-1">
                                  Drag & drop files here or click to browse
                                </p>
                                <p className="text-xs text-gray-500">
                                  Images (JPG, PNG, GIF) or PDF • Max 10MB each
                                </p>
                              </div>
                            )}
                          </div>
                          
                          {/* Uploaded Files List */}
                          {uploadedFiles.length > 0 && (
                            <div className="mt-4 space-y-2 max-h-32 overflow-y-auto">
                              {uploadedFiles.map((file, index) => (
                                <div key={index} className="flex items-center justify-between p-2 bg-white rounded-lg border border-green-200 shadow-sm">
                                  <div className="flex items-center space-x-2">
                                    <div className="w-6 h-6 bg-green-100 rounded flex items-center justify-center">
                                      <File className="h-3 w-3 text-green-600" />
                                    </div>
                                    <div>
                                      <span className="text-xs font-medium text-gray-700 block truncate max-w-20">{file.name}</span>
                                      <span className="text-xs text-gray-500">
                                        {(file.size / 1024 / 1024).toFixed(1)}MB
                                      </span>
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => removeFile(index)}
                                    className="w-6 h-6 flex items-center justify-center rounded-full bg-red-100 text-red-500 hover:bg-red-200 hover:text-red-600 transition-colors"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Pro Tip Section */}
                      <div className="flex flex-col h-full min-h-[400px]">
                        <div className="flex items-center space-x-2 mb-4">
                          <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-bold">💡</span>
                          </div>
                          <h4 className="text-lg font-semibold text-gray-800">Pro Tips</h4>
                        </div>
                        
                        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-lg p-4 border border-amber-100 flex-1 flex flex-col space-y-4">
                          <div className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-white text-xs">📝</span>
                            </div>
                            <div>
                              <h5 className="text-sm font-semibold text-amber-800 mb-1">Better Descriptions</h5>
                              <p className="text-xs text-amber-700">
                                Include room dimensions, current flooring condition, installation timeline, and budget range for more accurate quotes.
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-white text-xs">📸</span>
                            </div>
                            <div>
                              <h5 className="text-sm font-semibold text-amber-800 mb-1">Photo Guidelines</h5>
                              <p className="text-xs text-amber-700">
                                Clear room photos, existing flooring, or inspiration samples help retailers provide accurate quotes.
                              </p>
                            </div>
                          </div>

                          <div className="mt-auto">
                            <img
                              src={sampleFlooringImage}
                              alt="Sample flooring photo"
                              className="w-full h-24 object-cover rounded-lg border-2 border-white shadow-sm"
                            />
                            <p className="text-xs text-amber-700 mt-2 text-center font-medium">
                              Example of a good room photo
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="text-center pt-4">
                  <Button
                    type="submit"
                    size="lg"
                    disabled={!isFormValid() || isLoading}
                    className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:opacity-50 text-base font-semibold"
                  >
                    {isLoading ? "Submitting..." : "Get My Competitive Quotes"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default Quote;