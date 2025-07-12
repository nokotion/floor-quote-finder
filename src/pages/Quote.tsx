import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Upload, Check, Sparkles, User, MapPin, Package, Clock, FileText, Building } from "lucide-react";
import { formatAndValidatePostalCode, validatePostalCode } from "@/utils/postalCodeUtils";
import { supabase } from "@/integrations/supabase/client";
import { projectSizes } from "@/constants/flooringData";


interface QuoteFormData {
  selectedBrand: string;
  projectSize: string;
  installationType: string;
  postalCode: string;
  timeline: string;
  contactInfo: {
    name: string;
    email: string;
    phone: string;
    fullAddress: string;
    streetAddress: string;
    city: string;
    province: string;
  };
  projectDescription: string;
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
  const [formData, setFormData] = useState<QuoteFormData>({
    selectedBrand: '',
    projectSize: '',
    installationType: '',
    postalCode: '',
    timeline: '',
    contactInfo: {
      name: '',
      email: '',
      phone: '',
      fullAddress: '',
      streetAddress: '',
      city: '',
      province: ''
    },
    projectDescription: ''
  });

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
        selectedBrand: brandParam
      }));
    }

    if (sizeParam) {
      prefilled.size = sizeParam;
      setFormData(prev => ({
        ...prev,
        projectSize: sizeParam
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
    if (streetParam && cityParam && provinceParam) {
      const baseAddress = `${streetParam}, ${cityParam}, ${provinceParam}`;
      setFormData(prev => ({
        ...prev,
        streetAddress: baseAddress
      }));
    } else if (formattedAddressParam) {
      setFormData(prev => ({
        ...prev,
        streetAddress: formattedAddressParam
      }));
    }

    setPrefilledValues(prefilled);
  }, [searchParams, brands]);

  const updateFormData = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof QuoteFormData] as any,
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handlePostalCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const formatted = formatAndValidatePostalCode(inputValue, formData.postalCode);
    
    updateFormData('postalCode', formatted);
    
    if (postalCodeError) {
      setPostalCodeError("");
    }
  };

  const handlePostalCodeBlur = () => {
    if (formData.postalCode && !validatePostalCode(formData.postalCode)) {
      setPostalCodeError("Please enter a valid Canadian postal code (e.g., M5V 3A8)");
    } else {
      setPostalCodeError("");
    }
  };

  const calculateProgress = () => {
    const requiredFields = [
      formData.selectedBrand,
      formData.projectSize,
      formData.installationType,
      formData.postalCode && validatePostalCode(formData.postalCode),
      formData.timeline,
      formData.contactInfo.name,
      formData.contactInfo.email,
      formData.contactInfo.phone,
      formData.contactInfo.fullAddress
    ];
    const filledFields = requiredFields.filter(Boolean).length;
    return (filledFields / requiredFields.length) * 100;
  };

  const isFormValid = () => {
    return formData.selectedBrand &&
           formData.projectSize &&
           formData.installationType &&
           formData.postalCode && validatePostalCode(formData.postalCode) &&
           formData.timeline &&
           formData.contactInfo.name &&
           formData.contactInfo.email &&
           formData.contactInfo.phone &&
           formData.contactInfo.fullAddress;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submission started');
    console.log('Current user:', await supabase.auth.getUser());
    console.log('Current session:', await supabase.auth.getSession());
    
    if (formData.postalCode && !validatePostalCode(formData.postalCode)) {
      setPostalCodeError("Please enter a valid Canadian postal code (e.g., M5V 3A8)");
      return;
    }

    if (!isFormValid()) return;

    try {
      const leadInsertData = {
        customer_name: formData.contactInfo.name,
        customer_email: formData.contactInfo.email,
        customer_phone: formData.contactInfo.phone,
        postal_code: formData.postalCode,
        street_address: formData.contactInfo.fullAddress,
        brand_requested: formData.selectedBrand,
        square_footage: parseSquareFootage(formData.projectSize),
        project_type: null,
        installation_required: formData.installationType === 'supply-and-install',
        timeline: formData.timeline,
        notes: formData.projectDescription,
        status: 'pending_verification',
        is_verified: false
      };
      
      console.log('Attempting to insert lead data:', leadInsertData);
      
      // Save the lead to database with pending verification status
      const { data: leadData, error: leadError } = await supabase
        .from('leads')
        .insert(leadInsertData)
        .select()
        .single();

      if (leadError) {
        console.error('Error saving lead:', leadError);
        console.error('Lead error details:', {
          code: leadError.code,
          message: leadError.message,
          details: leadError.details,
          hint: leadError.hint
        });
        alert('Error submitting quote. Please try again.');
        return;
      }

      console.log('Lead saved for verification:', leadData);

      // Send verification code
      const contact = verificationMethod === 'email' ? formData.contactInfo.email : formData.contactInfo.phone;
      console.log(`Attempting to send ${verificationMethod} verification to:`, contact);
      
      const { data: verificationResult, error: verificationError } = await supabase.functions.invoke('send-verification', {
        body: {
          leadId: leadData.id,
          method: verificationMethod,
          contact: contact
        }
      });

      console.log('Verification function response:', { verificationResult, verificationError });

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

  const renderPrefilledBadge = () => (
    <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
      <Sparkles className="w-3 h-3 mr-1" />
      Pre-selected for you
    </Badge>
  );

  if (isSubmitted) {
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
              <h2 className="text-3xl font-bold mb-4">Quote Submitted Successfully!</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                We're matching you with verified retailers in your area. You'll receive quotes within 24-48 hours.
              </p>
              <div className="space-y-4">
                <Button asChild>
                  <Link to="/">Return Home</Link>
                </Button>
                <p className="text-sm text-gray-500">
                  Want updates? We'll email you when quotes arrive.
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
      {/* Sticky Header Container */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-md">
        {/* Progress Header */}
        <div className="border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link to="/" className="flex items-center">
                <img 
                  src="https://syjxtyvsencbmhuprnyu.supabase.co/storage/v1/object/public/pricemyfloor-files//pricemyfloor%20_logo.png" 
                  alt="Price My Floor Logo" 
                  className="h-12 w-auto"
                />
              </Link>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600">
                  {Math.round(calculateProgress())}% Complete
                </div>
                {(prefilledValues.brand || prefilledValues.size || prefilledValues.postal) && (
                  <Badge variant="secondary" className="bg-accent/10 text-accent-foreground">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Quick form used
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 h-2">
          <motion.div
            className="bg-gradient-to-r from-accent to-primary h-2"
            initial={{ width: 0 }}
            animate={{ width: `${calculateProgress()}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Single Page Form */}
      <div className="py-4 px-4">
        <div className="max-w-[960px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-4"
          >
            <h1 className="text-2xl font-bold mb-2">Get Your Free Flooring Quote</h1>
            <p className="text-sm text-gray-600">Complete the form below to connect with verified flooring retailers in your area</p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Brand Selection + Project Details Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {/* Brand Selection Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <Card className="shadow-lg h-full">
                  <CardHeader className="p-3">
                    <CardTitle className="flex items-center gap-2 text-base font-semibold">
                      <Building className="w-4 h-4 text-accent" />
                      Preferred Brand
                      {prefilledValues.brand && renderPrefilledBadge()}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <div>
                      <Label htmlFor="brand" className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                        Select Brand
                        {prefilledValues.brand && (
                          <Badge variant="outline" className="text-xs">Pre-filled</Badge>
                        )}
                      </Label>
                      <Select 
                        value={formData.selectedBrand} 
                        onValueChange={(value) => updateFormData('selectedBrand', value)}
                      >
                        <SelectTrigger className="mt-1 h-12 text-base focus:ring-2 focus:ring-orange-500 focus:border-orange-500 border-gray-200 font-medium">
                          <SelectValue placeholder="Select your preferred brand" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-gray-200 shadow-lg">
                          {brands.map((brand) => (
                            <SelectItem key={brand.id} value={brand.name} className="font-medium">
                              {brand.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Project Details Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15 }}
              >
                <Card className="shadow-lg h-full">
                  <CardHeader className="p-3">
                    <CardTitle className="flex items-center gap-2 text-base font-semibold">
                      <Package className="w-4 h-4 text-accent" />
                      Project Size
                      {prefilledValues.size && renderPrefilledBadge()}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <div>
                      <Label htmlFor="projectSize" className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                        Square Footage
                        {prefilledValues.size && (
                          <Badge variant="outline" className="text-xs">Pre-filled</Badge>
                        )}
                      </Label>
                      <Select 
                        value={formData.projectSize} 
                        onValueChange={(value) => updateFormData('projectSize', value)}
                      >
                        <SelectTrigger className="mt-1 h-12 text-base focus:ring-2 focus:ring-orange-500 focus:border-orange-500 border-gray-200 font-medium">
                          <SelectValue placeholder="Select project size" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-gray-200 shadow-lg">
                          {projectSizes.map((size) => (
                            <SelectItem key={size.value} value={size.value} className="font-medium">
                              {size.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Installation + Location Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {/* Installation Preference Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card className="shadow-lg h-full">
                  <CardHeader className="p-3">
                    <CardTitle className="flex items-center gap-2 text-base font-semibold">
                      <User className="w-4 h-4 text-accent" />
                      Installation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <RadioGroup 
                      value={formData.installationType} 
                      onValueChange={(value) => updateFormData('installationType', value)}
                      className="grid grid-cols-1 gap-2"
                    >
                        <div className="flex items-center space-x-2 p-2 border rounded-lg">
                        <RadioGroupItem value="supply-and-install" id="supply-and-install" />
                        <div>
                          <Label htmlFor="supply-and-install" className="text-sm font-semibold text-gray-800">Supply & Install</Label>
                          <p className="text-xs text-gray-600">Materials + installation</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 p-2 border rounded-lg">
                        <RadioGroupItem value="supply-only" id="supply-only" />
                        <div>
                          <Label htmlFor="supply-only" className="text-sm font-semibold text-gray-800">Supply Only</Label>
                          <p className="text-xs text-gray-600">Materials only</p>
                        </div>
                      </div>
                    </RadioGroup>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Location Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.25 }}
              >
                <Card className="shadow-lg h-full">
                  <CardHeader className="p-3">
                    <CardTitle className="flex items-center gap-2 text-base font-semibold">
                      <MapPin className="w-4 h-4 text-accent" />
                      Location
                      {prefilledValues.postal && renderPrefilledBadge()}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <div>
                      <Label htmlFor="postalCode" className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                        Postal Code
                        {prefilledValues.postal && (
                          <Badge variant="outline" className="text-xs">Pre-filled</Badge>
                        )}
                      </Label>
                      <Input
                        id="postalCode"
                        placeholder="e.g., M5V 3A8"
                        maxLength={7}
                        value={formData.postalCode}
                        onChange={handlePostalCodeChange}
                        onBlur={handlePostalCodeBlur}
                        className={`mt-1 h-12 text-base focus:ring-2 focus:ring-orange-500 focus:border-orange-500 border-gray-200 font-medium ${postalCodeError ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
                      />
                      {postalCodeError && (
                        <p className="text-sm text-red-600 mt-1 font-medium">{postalCodeError}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Timeline + Contact Information Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {/* Timeline Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Card className="shadow-lg h-full">
                  <CardHeader className="p-3">
                    <CardTitle className="flex items-center gap-2 text-base font-semibold">
                      <Clock className="w-4 h-4 text-accent" />
                      Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <RadioGroup 
                      value={formData.timeline} 
                      onValueChange={(value) => updateFormData('timeline', value)}
                      className="grid grid-cols-1 gap-4"
                    >
                      <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                        <RadioGroupItem value="As soon as possible" id="asap" />
                        <Label htmlFor="asap" className="text-sm font-medium">ASAP</Label>
                      </div>
                      <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                        <RadioGroupItem value="Within 1 month" id="within-month" />
                        <Label htmlFor="within-month" className="text-sm font-medium">Within 1 month</Label>
                      </div>
                    </RadioGroup>
                  </CardContent>
                </Card>
              </motion.div>

            {/* Contact Information Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.35 }}
              >
                <Card className="shadow-lg h-full">
                  <CardHeader className="p-3">
                    <CardTitle className="flex items-center gap-2 text-base font-semibold">
                      <User className="w-4 h-4 text-accent" />
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0 space-y-3">
                    <div>
                      <Label htmlFor="fullAddress" className="text-sm font-semibold text-gray-800">Full Address</Label>
                      {(prefilledValues.street || prefilledValues.formatted_address) ? (
                        <div className="mt-1">
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md mb-2">
                            <p className="text-sm text-blue-800 mb-1">
                              ✓ Address from Quick Quote: <strong>{prefilledValues.street ? `${prefilledValues.street}, ${prefilledValues.city}, ${prefilledValues.province}` : prefilledValues.formatted_address}</strong>
                            </p>
                            <p className="text-xs text-blue-600">Please add your house number:</p>
                          </div>
                          <Input
                            id="fullAddress"
                            value={formData.contactInfo.fullAddress}
                            onChange={(e) => updateFormData('contactInfo.fullAddress', e.target.value)}
                            placeholder={`Add house number to: ${prefilledValues.street ? `${prefilledValues.street}, ${prefilledValues.city}, ${prefilledValues.province}` : prefilledValues.formatted_address}`}
                            className="h-12 text-base focus:ring-2 focus:ring-orange-500 focus:border-orange-500 border-gray-200 font-medium"
                          />
                        </div>
                      ) : (
                        <Input
                          id="fullAddress"
                          value={formData.contactInfo.fullAddress}
                          onChange={(e) => updateFormData('contactInfo.fullAddress', e.target.value)}
                          placeholder="e.g., 123 Main Street, Toronto, ON M5V 3A8"
                          className="mt-1 h-12 text-base focus:ring-2 focus:ring-orange-500 focus:border-orange-500 border-gray-200 font-medium"
                        />
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="name" className="text-sm font-semibold text-gray-800">Full Name</Label>
                        <Input
                          id="name"
                          value={formData.contactInfo.name}
                          onChange={(e) => updateFormData('contactInfo.name', e.target.value)}
                          className="mt-1 h-10 text-base focus:ring-2 focus:ring-orange-500 focus:border-orange-500 border-gray-200 font-medium"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone" className="text-sm font-semibold text-gray-800">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.contactInfo.phone}
                          onChange={(e) => updateFormData('contactInfo.phone', e.target.value)}
                          className="mt-1 h-10 text-base focus:ring-2 focus:ring-orange-500 focus:border-orange-500 border-gray-200 font-medium"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-sm font-semibold text-gray-800">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.contactInfo.email}
                        onChange={(e) => updateFormData('contactInfo.email', e.target.value)}
                        className="mt-1 h-10 text-base focus:ring-2 focus:ring-orange-500 focus:border-orange-500 border-gray-200 font-medium"
                      />
                    </div>
                    
                    {/* Verification Method Selection */}
                    <div className="pt-2 border-t">
                      <Label className="text-sm font-semibold text-gray-800 mb-2 block">How would you like to verify your request?</Label>
                      <RadioGroup 
                        value={verificationMethod} 
                        onValueChange={(value) => setVerificationMethod(value as 'email' | 'sms')}
                        className="grid grid-cols-2 gap-2"
                      >
                        <div className="flex items-center space-x-2 p-2 border rounded-lg">
                          <RadioGroupItem value="email" id="verify-email" />
                          <Label htmlFor="verify-email" className="text-sm font-medium">Email</Label>
                        </div>
                        <div className="flex items-center space-x-2 p-2 border rounded-lg">
                          <RadioGroupItem value="sms" id="verify-sms" />
                          <Label htmlFor="verify-sms" className="text-sm font-medium">SMS</Label>
                        </div>
                      </RadioGroup>
                      <p className="text-xs text-gray-500 mt-1">
                        We'll send a verification code to confirm your request
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>


            {/* Additional Details Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="shadow-lg">
                <CardHeader className="p-4">
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                    <FileText className="w-4 h-4 text-accent" />
                    Additional Details
                  </CardTitle>
                  <p className="text-sm text-gray-600">Any specific requirements or questions?</p>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-3">
                  <div>
                    <Label htmlFor="description" className="text-sm font-semibold text-gray-800">Project Description (Optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your project, any specific requirements, budget range, or questions..."
                      value={formData.projectDescription}
                      onChange={(e) => updateFormData('projectDescription', e.target.value)}
                      rows={3}
                      className="mt-1 text-base focus:ring-2 focus:ring-orange-500 focus:border-orange-500 border-gray-200 font-medium"
                    />
                  </div>
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Example Image */}
                    <div className="flex-shrink-0">
                      <img 
                        src="https://syjxtyvsencbmhuprnyu.supabase.co/storage/v1/object/public/pricemyfloor-files//batchnumber.png"
                        alt="Example of flooring box edge showing batch number and product information"
                        className="w-48 h-36 object-cover rounded-lg border border-gray-200"
                      />
                    </div>
                    
                    {/* Upload Area */}
                    <div className="flex-1">
                      <div className="p-2 border-2 border-dashed border-gray-300 rounded-lg text-center h-20 flex flex-col justify-center">
                        <Upload className="w-6 h-6 mx-auto mb-1 text-gray-400" />
                        <p className="text-sm text-gray-600">Upload photos (Optional)</p>
                        <p className="text-xs text-gray-500">Drag and drop or click to select</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Helpful Caption */}
                  <p className="text-sm text-gray-600 mt-2">
                    <strong>Tip:</strong> A photo of the short box edge is helpful — it usually shows the batch number, square footage, color name, and production info.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-center pt-6"
            >
              <Button 
                type="submit" 
                size="lg" 
                disabled={!isFormValid()}
                className="px-8 py-3 text-base bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Quote Request
              </Button>
              <p className="text-sm text-gray-500 mt-3">
                You'll receive quotes within 24-48 hours
              </p>
            </motion.div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Quote;