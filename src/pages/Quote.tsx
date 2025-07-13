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
import AddressAutocomplete, { AddressData } from "@/components/ui/address-autocomplete";


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
    if (formattedAddressParam) {
      setFormData(prev => ({
        ...prev,
        contactInfo: {
          ...prev.contactInfo,
          fullAddress: formattedAddressParam,
          city: cityParam || prev.contactInfo.city,
          province: provinceParam || prev.contactInfo.province
        }
      }));
    } else if (streetParam && cityParam && provinceParam) {
      const baseAddress = `${streetParam}, ${cityParam}, ${provinceParam}`;
      setFormData(prev => ({
        ...prev,
        contactInfo: {
          ...prev.contactInfo,
          fullAddress: baseAddress,
          city: cityParam,
          province: provinceParam
        }
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

  const handleAddressChange = (address: string, addressData?: AddressData) => {
    updateFormData('contactInfo.fullAddress', address);
    
    // Extract and update city and province if available from addressData
    if (addressData) {
      if (addressData.locality) {
        updateFormData('contactInfo.city', addressData.locality);
      }
      if (addressData.administrative_area_level_1) {
        updateFormData('contactInfo.province', addressData.administrative_area_level_1);
      }
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-purple-50/30">
      {/* Sticky Header Container */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-md border-b-2 border-gradient-to-r from-blue-500 to-purple-500">
        {/* Progress Header */}
        <div className="border-b border-blue-100">
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
                <div className="text-sm font-medium text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
                  {Math.round(calculateProgress())}% Complete
                </div>
                {(prefilledValues.brand || prefilledValues.size || prefilledValues.postal) && (
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-emerald-200">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Quick form used
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-blue-100 h-3">
          <motion.div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-r-full"
            initial={{ width: 0 }}
            animate={{ width: `${calculateProgress()}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Single Page Form */}
      <div className="py-6 px-4">
        <div className="max-w-[960px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-6"
          >
            <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Get Your Free Flooring Quote</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">Complete the form below to connect with verified flooring retailers in your area</p>
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
                <Card className="shadow-lg h-full bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200">
                  <CardHeader className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
                    <CardTitle className="flex items-center gap-2 text-base font-semibold">
                      <Building className="w-4 h-4" />
                      Preferred Brand
                      {prefilledValues.brand && renderPrefilledBadge()}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div>
                      <Label htmlFor="brand" className="flex items-center gap-2 text-sm font-semibold text-blue-800">
                        Select Brand
                        {prefilledValues.brand && (
                          <Badge variant="outline" className="text-xs border-blue-300 text-blue-700">Pre-filled</Badge>
                        )}
                      </Label>
                      <Select 
                        value={formData.selectedBrand} 
                        onValueChange={(value) => updateFormData('selectedBrand', value)}
                      >
                        <SelectTrigger className="mt-2 h-12 text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-blue-200 font-medium bg-white">
                          <SelectValue placeholder="Select your preferred brand" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-blue-200 shadow-lg">
                          {brands.map((brand) => (
                            <SelectItem key={brand.id} value={brand.name} className="font-medium hover:bg-blue-50">
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
                <Card className="shadow-lg h-full bg-gradient-to-br from-green-50 to-green-100/50 border-green-200">
                  <CardHeader className="p-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg">
                    <CardTitle className="flex items-center gap-2 text-base font-semibold">
                      <Package className="w-4 h-4" />
                      Project Size
                      {prefilledValues.size && renderPrefilledBadge()}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div>
                      <Label htmlFor="projectSize" className="flex items-center gap-2 text-sm font-semibold text-green-800">
                        Square Footage
                        {prefilledValues.size && (
                          <Badge variant="outline" className="text-xs border-green-300 text-green-700">Pre-filled</Badge>
                        )}
                      </Label>
                      <Select 
                        value={formData.projectSize} 
                        onValueChange={(value) => updateFormData('projectSize', value)}
                      >
                        <SelectTrigger className="mt-2 h-12 text-base focus:ring-2 focus:ring-green-500 focus:border-green-500 border-green-200 font-medium bg-white">
                          <SelectValue placeholder="Select project size" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-green-200 shadow-lg">
                          {projectSizes.map((size) => (
                            <SelectItem key={size.value} value={size.value} className="font-medium hover:bg-green-50">
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

            {/* Installation + Timeline Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {/* Installation Preference Section */}
               <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card className="shadow-lg h-full bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-200">
                  <CardHeader className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-t-lg">
                    <CardTitle className="flex items-center gap-2 text-base font-semibold">
                      <User className="w-4 h-4" />
                      Installation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <RadioGroup 
                      value={formData.installationType} 
                      onValueChange={(value) => updateFormData('installationType', value)}
                      className="grid grid-cols-1 gap-3"
                    >
                      <div className="flex items-center space-x-3 p-3 border-2 border-orange-200 rounded-lg hover:bg-orange-50 hover:border-orange-300 transition-colors">
                        <RadioGroupItem value="supply-and-install" id="supply-and-install" className="border-orange-500" />
                        <div>
                          <Label htmlFor="supply-and-install" className="text-sm font-semibold text-orange-800">Supply & Install</Label>
                          <p className="text-xs text-orange-600">Materials + installation</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 border-2 border-orange-200 rounded-lg hover:bg-orange-50 hover:border-orange-300 transition-colors">
                        <RadioGroupItem value="supply-only" id="supply-only" className="border-orange-500" />
                        <div>
                          <Label htmlFor="supply-only" className="text-sm font-semibold text-orange-800">Supply Only</Label>
                          <p className="text-xs text-orange-600">Materials only</p>
                        </div>
                      </div>
                    </RadioGroup>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Timeline Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.25 }}
              >
                <Card className="shadow-lg h-full bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200">
                  <CardHeader className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-t-lg">
                    <CardTitle className="flex items-center gap-2 text-base font-semibold">
                      <Clock className="w-4 h-4" />
                      Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <RadioGroup 
                      value={formData.timeline} 
                      onValueChange={(value) => updateFormData('timeline', value)}
                      className="grid grid-cols-1 gap-3"
                    >
                      <div className="flex items-center space-x-3 p-3 border-2 border-purple-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-colors">
                        <RadioGroupItem value="As soon as possible" id="asap" className="border-purple-500" />
                        <Label htmlFor="asap" className="text-sm font-semibold text-purple-800">ASAP</Label>
                      </div>
                      <div className="flex items-center space-x-3 p-3 border-2 border-purple-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-colors">
                        <RadioGroupItem value="Within 1 month" id="within-month" className="border-purple-500" />
                        <Label htmlFor="within-month" className="text-sm font-semibold text-purple-800">Within 1 month</Label>
                      </div>
                    </RadioGroup>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Contact & Location Information Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="shadow-lg bg-gradient-to-br from-cyan-50 to-cyan-100/50 border-cyan-200">
                <CardHeader className="p-3 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2 text-base font-semibold">
                    <MapPin className="w-4 h-4" />
                    Contact & Location Information
                    {(prefilledValues.postal || prefilledValues.formatted_address) && renderPrefilledBadge()}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  {/* Address Section */}
                  <div>
                    <Label htmlFor="fullAddress" className="text-sm font-semibold text-cyan-800">Your Street Address</Label>
                    {prefilledValues.formatted_address && (
                      <div className="p-3 bg-emerald-50 border-2 border-emerald-200 rounded-lg mb-3 shadow-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                          <p className="text-sm text-emerald-800 font-medium">
                            <strong>Address confirmed:</strong> {prefilledValues.formatted_address}
                          </p>
                        </div>
                      </div>
                    )}
                    <p className="text-sm text-cyan-700 mb-2">Enter your complete street address for the quote:</p>
                    <AddressAutocomplete
                      id="fullAddress"
                      value={formData.contactInfo.fullAddress}
                      onChange={handleAddressChange}
                      placeholder="123 Main Street, Mississauga, ON"
                      className="mt-2 h-12 text-base focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 border-cyan-200 font-medium bg-white"
                    />
                    <p className="text-xs text-cyan-600 mt-1">This address will be used for your flooring quote and installation details.</p>
                  </div>

                  {/* Contact Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name" className="text-sm font-semibold text-cyan-800">Full Name</Label>
                      <Input
                        id="name"
                        value={formData.contactInfo.name}
                        onChange={(e) => updateFormData('contactInfo.name', e.target.value)}
                        className="mt-2 h-11 text-base focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 border-cyan-200 font-medium bg-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-sm font-semibold text-cyan-800">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.contactInfo.phone}
                        onChange={(e) => updateFormData('contactInfo.phone', e.target.value)}
                        className="mt-2 h-11 text-base focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 border-cyan-200 font-medium bg-white"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="email" className="text-sm font-semibold text-cyan-800">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.contactInfo.email}
                      onChange={(e) => updateFormData('contactInfo.email', e.target.value)}
                      className="mt-2 h-11 text-base focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 border-cyan-200 font-medium bg-white"
                    />
                  </div>
                  
                  {/* Verification Method Selection */}
                  <div className="pt-3 border-t-2 border-cyan-200">
                    <Label className="text-sm font-semibold text-cyan-800 mb-3 block">How would you like to verify your request?</Label>
                    <RadioGroup 
                      value={verificationMethod} 
                      onValueChange={(value) => setVerificationMethod(value as 'email' | 'sms')}
                      className="grid grid-cols-2 gap-3"
                    >
                      <div className="flex items-center space-x-3 p-3 border-2 border-cyan-200 rounded-lg hover:bg-cyan-50 hover:border-cyan-300 transition-colors">
                        <RadioGroupItem value="email" id="verify-email" className="border-cyan-500" />
                        <Label htmlFor="verify-email" className="text-sm font-semibold text-cyan-800">Email</Label>
                      </div>
                      <div className="flex items-center space-x-3 p-3 border-2 border-cyan-200 rounded-lg hover:bg-cyan-50 hover:border-cyan-300 transition-colors">
                        <RadioGroupItem value="sms" id="verify-sms" className="border-cyan-500" />
                        <Label htmlFor="verify-sms" className="text-sm font-semibold text-cyan-800">SMS</Label>
                      </div>
                    </RadioGroup>
                    <p className="text-xs text-cyan-600 mt-2">
                      We'll send a verification code to confirm your request
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>


            {/* Additional Details Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="shadow-lg bg-gradient-to-br from-slate-50 to-slate-100/50 border-slate-200">
                <CardHeader className="p-3 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2 text-base font-semibold">
                    <FileText className="w-4 h-4" />
                    Additional Details
                  </CardTitle>
                  <p className="text-sm text-slate-100">Any specific requirements or questions?</p>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <div>
                    <Label htmlFor="description" className="text-sm font-semibold text-slate-800">Project Description (Optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your project, any specific requirements, budget range, or questions..."
                      value={formData.projectDescription}
                      onChange={(e) => updateFormData('projectDescription', e.target.value)}
                      rows={3}
                      className="mt-2 text-base focus:ring-2 focus:ring-slate-500 focus:border-slate-500 border-slate-200 font-medium bg-white"
                    />
                  </div>
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Example Image */}
                    <div className="flex-shrink-0">
                      <img 
                        src="https://syjxtyvsencbmhuprnyu.supabase.co/storage/v1/object/public/pricemyfloor-files//batchnumber.png"
                        alt="Example of flooring box edge showing batch number and product information"
                        className="w-48 h-36 object-cover rounded-lg border-2 border-slate-200 shadow-sm"
                      />
                    </div>
                    
                    {/* Upload Area */}
                    <div className="flex-1">
                      <div className="p-4 border-2 border-dashed border-slate-300 rounded-lg text-center h-32 flex flex-col justify-center hover:border-slate-400 transition-colors bg-slate-50/50">
                        <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                        <p className="text-sm text-slate-600 font-medium">Upload photos (Optional)</p>
                        <p className="text-xs text-slate-500">Drag and drop or click to select</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Helpful Caption */}
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>💡 Tip:</strong> A photo of the short box edge is helpful — it usually shows the batch number, square footage, color name, and production info.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-center pt-8"
            >
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-6 rounded-xl shadow-lg">
                <Button 
                  type="submit" 
                  size="lg" 
                  disabled={!isFormValid()}
                  className="px-12 py-4 text-lg font-semibold bg-white text-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all border-0"
                >
                  Submit Quote Request
                </Button>
                <p className="text-sm text-white mt-3 font-medium">
                  You'll receive quotes within 24-48 hours
                </p>
              </div>
            </motion.div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Quote;