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

interface QuoteFormData {
  selectedBrand: string;
  projectSize: string;
  roomType: string;
  installationType: string;
  postalCode: string;
  timeline: string;
  contactInfo: {
    name: string;
    email: string;
    phone: string;
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
}

const Quote = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [prefilledValues, setPrefilledValues] = useState<PrefilledValues>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [postalCodeError, setPostalCodeError] = useState("");
  const [brands, setBrands] = useState<Brand[]>([]);
  const [formData, setFormData] = useState<QuoteFormData>({
    selectedBrand: '',
    projectSize: '',
    roomType: '',
    installationType: '',
    postalCode: '',
    timeline: '',
    contactInfo: {
      name: '',
      email: '',
      phone: ''
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

  // Handle URL parameter pre-filling
  useEffect(() => {
    const brandParam = searchParams.get('brand');
    const sizeParam = searchParams.get('size');
    const postalParam = searchParams.get('postal');

    const prefilled: PrefilledValues = {};

    if (brandParam) {
      prefilled.brand = brandParam;
      setFormData(prev => ({
        ...prev,
        selectedBrand: brandParam === 'no-preference' ? 'No preference - show me options' : brandParam
      }));
    }

    if (sizeParam) {
      prefilled.size = sizeParam;
      // Convert size range to approximate square footage for form
      const sizeMap: { [key: string]: string } = {
        '100-500': '300 sq ft',
        '500-1000': '750 sq ft', 
        '1000-2000': '1500 sq ft',
        '2000+': '2500 sq ft'
      };
      setFormData(prev => ({
        ...prev,
        projectSize: sizeMap[sizeParam] || sizeParam
      }));
    }

    if (postalParam) {
      prefilled.postal = postalParam;
      setFormData(prev => ({
        ...prev,
        postalCode: postalParam
      }));
    }

    setPrefilledValues(prefilled);
  }, [searchParams]);

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
      formData.roomType,
      formData.installationType,
      formData.postalCode && validatePostalCode(formData.postalCode),
      formData.timeline,
      formData.contactInfo.name,
      formData.contactInfo.email,
      formData.contactInfo.phone
    ];
    const filledFields = requiredFields.filter(Boolean).length;
    return (filledFields / requiredFields.length) * 100;
  };

  const isFormValid = () => {
    return formData.selectedBrand &&
           formData.projectSize &&
           formData.roomType &&
           formData.installationType &&
           formData.postalCode && validatePostalCode(formData.postalCode) &&
           formData.timeline &&
           formData.contactInfo.name &&
           formData.contactInfo.email &&
           formData.contactInfo.phone;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.postalCode && !validatePostalCode(formData.postalCode)) {
      setPostalCodeError("Please enter a valid Canadian postal code (e.g., M5V 3A8)");
      return;
    }

    if (!isFormValid()) return;

    try {
      // First, save the lead to database
      const { data: leadData, error: leadError } = await supabase
        .from('leads')
        .insert({
          customer_name: formData.contactInfo.name,
          customer_email: formData.contactInfo.email,
          customer_phone: formData.contactInfo.phone,
          postal_code: formData.postalCode,
          brand_requested: formData.selectedBrand,
          square_footage: parseSquareFootage(formData.projectSize),
          project_type: formData.roomType,
          installation_required: formData.installationType === 'supply-and-install',
          timeline: formData.timeline,
          notes: formData.projectDescription,
          status: 'new'
        })
        .select()
        .single();

      if (leadError) {
        console.error('Error saving lead:', leadError);
        alert('Error submitting quote. Please try again.');
        return;
      }

      console.log('Lead saved:', leadData);

      // Process the lead for distribution
      const { data: processResult, error: processError } = await supabase.functions.invoke('process-lead-submission', {
        body: {
          leadData: {
            ...leadData,
            selectedBrand: formData.selectedBrand,
            projectSize: formData.projectSize,
            roomType: formData.roomType,
            installationType: formData.installationType,
            postalCode: formData.postalCode,
            timeline: formData.timeline,
            contactInfo: formData.contactInfo,
            projectDescription: formData.projectDescription
          }
        }
      });

      if (processError) {
        console.error('Error processing lead:', processError);
        // Still show success to user even if distribution fails
      } else {
        console.log('Lead processing result:', processResult);
      }

      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting quote:', error);
      alert('Error submitting quote. Please try again.');
    }
  };

  // Helper function to parse square footage
  const parseSquareFootage = (sizeString: string): number => {
    const match = sizeString.match(/(\d+)/);
    return match ? parseInt(match[1]) : 500;
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
            {/* Brand Selection Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="shadow-lg">
                <CardHeader className="p-4">
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                    <Building className="w-4 h-4 text-accent" />
                    Select Your Preferred Brand
                    {prefilledValues.brand && renderPrefilledBadge()}
                  </CardTitle>
                  <p className="text-sm text-gray-600">Choose your preferred flooring brand</p>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div>
                    <Label htmlFor="brand" className="flex items-center gap-2 text-sm font-semibold">
                      Preferred Brand
                      {prefilledValues.brand && (
                        <Badge variant="outline" className="text-xs">Pre-filled from quick form</Badge>
                      )}
                    </Label>
                    <Select 
                      value={formData.selectedBrand} 
                      onValueChange={(value) => updateFormData('selectedBrand', value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select your preferred brand" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="No preference - show me options">No preference - show me options</SelectItem>
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
            </motion.div>

            {/* Project Details Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="shadow-lg">
                <CardHeader className="p-4">
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                    <Package className="w-4 h-4 text-accent" />
                    Project Details
                    {prefilledValues.size && renderPrefilledBadge()}
                  </CardTitle>
                  <p className="text-sm text-gray-600">Tell us about your flooring project</p>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-4">
                  <div>
                    <Label htmlFor="projectSize" className="flex items-center gap-2 text-sm font-semibold">
                      Approximate square footage
                      {prefilledValues.size && (
                        <Badge variant="outline" className="text-xs">Pre-filled from quick form</Badge>
                      )}
                    </Label>
                    <Input
                      id="projectSize"
                      placeholder="e.g., 500 sq ft"
                      value={formData.projectSize}
                      onChange={(e) => updateFormData('projectSize', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <Separator />
                  <div>
                    <Label className="text-sm font-semibold mb-2 block">Room type</Label>
                    <RadioGroup 
                      value={formData.roomType} 
                      onValueChange={(value) => updateFormData('roomType', value)}
                      className="grid grid-cols-2 md:grid-cols-3 gap-2"
                    >
                      {["Living Room", "Kitchen", "Bedroom", "Bathroom", "Basement", "Whole House", "Other"].map((room) => (
                        <div key={room} className="flex items-center space-x-2">
                          <RadioGroupItem value={room} id={room} />
                          <Label htmlFor={room} className="text-sm">{room}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Installation Preference Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="shadow-lg">
                <CardHeader className="p-4">
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                    <User className="w-4 h-4 text-accent" />
                    Installation Preference
                  </CardTitle>
                  <p className="text-sm text-gray-600">Do you need installation services?</p>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <RadioGroup 
                    value={formData.installationType} 
                    onValueChange={(value) => updateFormData('installationType', value)}
                    className="grid grid-cols-1 md:grid-cols-2 gap-3"
                  >
                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value="supply-and-install" id="supply-and-install" />
                      <div>
                        <Label htmlFor="supply-and-install" className="text-sm font-medium">Supply & Install</Label>
                        <p className="text-xs text-gray-600">Materials and professional installation included</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value="supply-only" id="supply-only" />
                      <div>
                        <Label htmlFor="supply-only" className="text-sm font-medium">Supply Only</Label>
                        <p className="text-xs text-gray-600">Materials only, I'll handle installation</p>
                      </div>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            </motion.div>

            {/* Location & Timeline Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="shadow-lg">
                <CardHeader className="p-4">
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                    <MapPin className="w-4 h-4 text-accent" />
                    Location & Timeline
                    {prefilledValues.postal && renderPrefilledBadge()}
                  </CardTitle>
                  <p className="text-sm text-gray-600">Help us find retailers in your area</p>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-4">
                  <div>
                    <Label htmlFor="postalCode" className="flex items-center gap-2 text-sm font-semibold">
                      Postal Code
                      {prefilledValues.postal && (
                        <Badge variant="outline" className="text-xs">Pre-filled from quick form</Badge>
                      )}
                    </Label>
                    <Input
                      id="postalCode"
                      placeholder="e.g., M5V 3A8"
                      maxLength={7}
                      value={formData.postalCode}
                      onChange={handlePostalCodeChange}
                      onBlur={handlePostalCodeBlur}
                      className={`mt-1 ${postalCodeError ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
                    />
                    {postalCodeError && (
                      <p className="text-sm text-red-600 mt-1">{postalCodeError}</p>
                    )}
                  </div>
                  <Separator />
                  <div>
                    <Label className="flex items-center gap-2 text-sm font-semibold mb-2">
                      <Clock className="w-4 h-4" />
                      When do you plan to start?
                    </Label>
                    <RadioGroup 
                      value={formData.timeline} 
                      onValueChange={(value) => updateFormData('timeline', value)}
                      className="grid grid-cols-1 sm:grid-cols-2 gap-2"
                    >
                      {[
                        "As soon as possible",
                        "Within 1 month", 
                        "1-3 months",
                        "3-6 months",
                        "Just browsing/planning"
                      ].map((timeline) => (
                        <div key={timeline} className="flex items-center space-x-2">
                          <RadioGroupItem value={timeline} id={timeline} />
                          <Label htmlFor={timeline} className="text-sm">{timeline}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Contact Information Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Card className="shadow-lg">
                <CardHeader className="p-4">
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                    <User className="w-4 h-4 text-accent" />
                    Contact Information
                  </CardTitle>
                  <p className="text-sm text-gray-600">How should retailers contact you?</p>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="name" className="text-sm font-semibold">Full Name</Label>
                      <Input
                        id="name"
                        value={formData.contactInfo.name}
                        onChange={(e) => updateFormData('contactInfo.name', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-sm font-semibold">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.contactInfo.phone}
                        onChange={(e) => updateFormData('contactInfo.phone', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-sm font-semibold">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.contactInfo.email}
                      onChange={(e) => updateFormData('contactInfo.email', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Additional Details Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
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
                    <Label htmlFor="description" className="text-sm font-semibold">Project Description (Optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your project, any specific requirements, budget range, or questions..."
                      value={formData.projectDescription}
                      onChange={(e) => updateFormData('projectDescription', e.target.value)}
                      rows={3}
                      className="mt-1"
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
              transition={{ duration: 0.6, delay: 0.7 }}
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