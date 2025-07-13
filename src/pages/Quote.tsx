import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Check, Mail, Phone, MapPin, User } from "lucide-react";
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

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center py-12"
            >
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Quote Submitted Successfully!</h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                We're matching you with verified retailers in your area. You'll receive quotes within 24-48 hours.
              </p>
              <div className="space-y-4">
                <Button asChild>
                  <Link to="/">Return Home</Link>
                </Button>
                <p className="text-sm text-muted-foreground">
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
    <div className="min-h-screen bg-neutral-50">
      {/* Simple Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <Link to="/" className="flex items-center">
            <img 
              src="https://syjxtyvsencbmhuprnyu.supabase.co/storage/v1/object/public/pricemyfloor-files//pricemyfloor%20_logo.png" 
              alt="Price My Floor Logo" 
              className="h-8 w-auto"
            />
          </Link>
        </div>
      </div>

      {/* Form Container */}
      <div className="py-8 px-6">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-semibold mb-3 text-slate-900">Get Your Free Flooring Quote</h1>
            <p className="text-slate-600 text-lg">Tell us about your project and we'll connect you with verified retailers</p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Preferred Brand */}
            <Card className="bg-white border border-neutral-200 shadow-sm">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <Label htmlFor="brand" className="text-base font-medium text-slate-900">
                    Preferred Brand
                  </Label>
                  <Select 
                    value={formData.selectedBrand} 
                    onValueChange={(value) => updateFormData('selectedBrand', value)}
                  >
                    <SelectTrigger className="h-12 border-neutral-300 text-base">
                      <SelectValue placeholder="Select your preferred brand" />
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
              </CardContent>
            </Card>

            {/* Decorative Wave */}
            <div className="flex justify-center py-2">
              <svg width="200" height="30" viewBox="0 0 200 30" className="text-accent">
                <path
                  d="M0 15 Q50 0 100 15 T200 15"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* Project Size */}
            <Card className="bg-white border border-neutral-200 shadow-sm">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <Label htmlFor="projectSize" className="text-base font-medium text-slate-900">
                    Project Size
                  </Label>
                  <Select 
                    value={formData.projectSize} 
                    onValueChange={(value) => updateFormData('projectSize', value)}
                  >
                    <SelectTrigger className="h-12 border-neutral-300 text-base">
                      <SelectValue placeholder="Select project size" />
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
              </CardContent>
            </Card>

             {/* Decorative Wave */}
             <div className="flex justify-center py-2">
               <svg width="200" height="30" viewBox="0 0 200 30" className="text-accent">
                 <path
                   d="M0 15 Q50 30 100 15 T200 15"
                   stroke="currentColor"
                   strokeWidth="2"
                   fill="none"
                   strokeLinecap="round"
                 />
               </svg>
             </div>

            {/* Installation */}
            <Card className="bg-white border border-neutral-200 shadow-sm">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <Label className="text-base font-medium text-slate-900">Installation</Label>
                  <RadioGroup 
                    value={formData.installationType} 
                    onValueChange={(value) => updateFormData('installationType', value)}
                    className="space-y-2"
                  >
                    <div className="flex items-center space-x-3 p-3 border border-neutral-200 rounded-lg hover:bg-neutral-50">
                      <RadioGroupItem value="supply-and-install" id="supply-and-install" />
                      <div>
                        <Label htmlFor="supply-and-install" className="text-base font-medium text-slate-900">Supply & Install</Label>
                        <p className="text-sm text-slate-600">Materials + installation</p>
                      </div>
                    </div>
                     <div className="flex items-center space-x-3 p-3 border border-neutral-200 rounded-lg hover:bg-neutral-50">
                       <RadioGroupItem value="supply-only" id="supply-only" />
                       <div>
                         <Label htmlFor="supply-only" className="text-base font-medium text-slate-900">Supply Only</Label>
                         <p className="text-sm text-slate-600">Materials only</p>
                       </div>
                     </div>
                   </RadioGroup>
                 </div>
               </CardContent>
             </Card>

             {/* Decorative Wave */}
             <div className="flex justify-center py-2">
               <svg width="200" height="30" viewBox="0 0 200 30" className="text-accent">
                 <path
                   d="M0 15 Q50 0 100 15 T200 15"
                   stroke="currentColor"
                   strokeWidth="2"
                   fill="none"
                   strokeLinecap="round"
                 />
               </svg>
             </div>

             {/* Timeline */}
             <Card className="bg-white border border-neutral-200 shadow-sm">
               <CardContent className="p-6">
                 <div className="space-y-3">
                   <Label className="text-base font-medium text-slate-900">Timeline</Label>
                   <RadioGroup 
                     value={formData.timeline} 
                     onValueChange={(value) => updateFormData('timeline', value)}
                     className="space-y-2"
                   >
                     <div className="flex items-center space-x-3 p-3 border border-neutral-200 rounded-lg hover:bg-neutral-50">
                       <RadioGroupItem value="As soon as possible" id="asap" />
                       <Label htmlFor="asap" className="text-base font-medium text-slate-900">ASAP</Label>
                     </div>
                     <div className="flex items-center space-x-3 p-3 border border-neutral-200 rounded-lg hover:bg-neutral-50">
                       <RadioGroupItem value="Within 1 month" id="within-month" />
                       <Label htmlFor="within-month" className="text-base font-medium text-slate-900">Within 1 month</Label>
                     </div>
                   </RadioGroup>
                 </div>
               </CardContent>
             </Card>

             {/* Decorative Wave */}
             <div className="flex justify-center py-2">
               <svg width="200" height="30" viewBox="0 0 200 30" className="text-accent">
                 <path
                   d="M0 15 Q50 30 100 15 T200 15"
                   stroke="currentColor"
                   strokeWidth="2"
                   fill="none"
                   strokeLinecap="round"
                 />
               </svg>
             </div>

             {/* Contact Information */}
             <Card className="bg-white border border-neutral-200 shadow-sm">
               <CardContent className="p-6">
                 <div className="space-y-4">
                  <h3 className="text-base font-medium text-slate-900">Contact Information</h3>
                  
                  {/* Name and Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm text-slate-700">Full Name</Label>
                      <Input
                        id="name"
                        value={formData.contactInfo.name}
                        onChange={(e) => updateFormData('contactInfo.name', e.target.value)}
                        className="h-12 border-neutral-300 text-base"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm text-slate-700">
                        <Mail className="inline w-4 h-4 mr-1" />
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.contactInfo.email}
                        onChange={(e) => updateFormData('contactInfo.email', e.target.value)}
                        className="h-12 border-neutral-300 text-base"
                        placeholder="Enter your email address"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm text-slate-700">
                      <Phone className="inline w-4 h-4 mr-1" />
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.contactInfo.phone}
                      onChange={(e) => updateFormData('contactInfo.phone', e.target.value)}
                      className="h-12 border-neutral-300 text-base"
                      placeholder="Enter your phone number"
                    />
                  </div>

                  {/* Address */}
                  <div className="space-y-2">
                    <Label htmlFor="fullAddress" className="text-sm text-slate-700">
                      <MapPin className="inline w-4 h-4 mr-1" />
                      Street Address
                    </Label>
                    <AddressAutocomplete
                      id="fullAddress"
                      value={formData.contactInfo.fullAddress}
                      onChange={handleAddressChange}
                      placeholder="123 Main Street, City, Province"
                      className="h-12 border-neutral-300 text-base"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="text-center pt-6">
              <Button 
                type="submit" 
                size="lg" 
                disabled={!isFormValid()}
                className="h-14 px-12 text-lg font-medium bg-slate-900 hover:bg-slate-800 text-white"
              >
                Continue
              </Button>
              <p className="text-sm text-slate-500 mt-4">
                By submitting this form, you agree to be contacted by qualified flooring retailers regarding your project.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Quote;