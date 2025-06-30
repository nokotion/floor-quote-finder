
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ChevronRight, ChevronLeft, Upload, Check } from "lucide-react";

interface QuoteFormData {
  brands: string[];
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

const Quote = () => {
  const [searchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<QuoteFormData>({
    brands: searchParams.get('brand') ? [searchParams.get('brand')!] : [],
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

  const totalSteps = 6;

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

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    // Here you would typically send the data to your backend
    console.log('Quote submitted:', formData);
    setCurrentStep(totalSteps + 1); // Show confirmation
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <CardHeader>
              <CardTitle>Select Your Preferred Brands</CardTitle>
              <p className="text-gray-600">Choose one or more flooring brands you're interested in</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                "Bruce Hardwood", "Shaw Floors", "Mohawk Flooring", "Daltile", 
                "Luxury Vinyl Pro", "Stainmaster", "No preference - show me options"
              ].map((brand) => (
                <div key={brand} className="flex items-center space-x-2">
                  <Checkbox
                    id={brand}
                    checked={formData.brands.includes(brand)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        updateFormData('brands', [...formData.brands, brand]);
                      } else {
                        updateFormData('brands', formData.brands.filter(b => b !== brand));
                      }
                    }}
                  />
                  <Label htmlFor={brand} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {brand}
                  </Label>
                </div>
              ))}
            </CardContent>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
              <p className="text-gray-600">Tell us about your flooring project</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="projectSize">Approximate square footage</Label>
                <Input
                  id="projectSize"
                  placeholder="e.g., 500 sq ft"
                  value={formData.projectSize}
                  onChange={(e) => updateFormData('projectSize', e.target.value)}
                />
              </div>
              <div>
                <Label>Room type</Label>
                <RadioGroup 
                  value={formData.roomType} 
                  onValueChange={(value) => updateFormData('roomType', value)}
                  className="mt-2"
                >
                  {["Living Room", "Kitchen", "Bedroom", "Bathroom", "Basement", "Whole House", "Other"].map((room) => (
                    <div key={room} className="flex items-center space-x-2">
                      <RadioGroupItem value={room} id={room} />
                      <Label htmlFor={room}>{room}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </CardContent>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <CardHeader>
              <CardTitle>Installation Preference</CardTitle>
              <p className="text-gray-600">Do you need installation services?</p>
            </CardHeader>
            <CardContent>
              <RadioGroup 
                value={formData.installationType} 
                onValueChange={(value) => updateFormData('installationType', value)}
                className="space-y-4"
              >
                <div className="flex items-center space-x-2 p-4 border rounded-lg">
                  <RadioGroupItem value="supply-and-install" id="supply-and-install" />
                  <div>
                    <Label htmlFor="supply-and-install" className="font-medium">Supply & Install</Label>
                    <p className="text-sm text-gray-600">Materials and professional installation included</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 p-4 border rounded-lg">
                  <RadioGroupItem value="supply-only" id="supply-only" />
                  <div>
                    <Label htmlFor="supply-only" className="font-medium">Supply Only</Label>
                    <p className="text-sm text-gray-600">Materials only, I'll handle installation</p>
                  </div>
                </div>
              </RadioGroup>
            </CardContent>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <CardHeader>
              <CardTitle>Location & Timeline</CardTitle>
              <p className="text-gray-600">Help us find retailers in your area</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="postalCode">Postal Code (first 3 characters)</Label>
                <Input
                  id="postalCode"
                  placeholder="e.g., M5V"
                  maxLength={3}
                  value={formData.postalCode}
                  onChange={(e) => updateFormData('postalCode', e.target.value.toUpperCase())}
                />
              </div>
              <div>
                <Label>When do you plan to start?</Label>
                <RadioGroup 
                  value={formData.timeline} 
                  onValueChange={(value) => updateFormData('timeline', value)}
                  className="mt-2"
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
                      <Label htmlFor={timeline}>{timeline}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </CardContent>
          </motion.div>
        );

      case 5:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <p className="text-gray-600">How should retailers contact you?</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.contactInfo.name}
                  onChange={(e) => updateFormData('contactInfo.name', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.contactInfo.email}
                  onChange={(e) => updateFormData('contactInfo.email', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.contactInfo.phone}
                  onChange={(e) => updateFormData('contactInfo.phone', e.target.value)}
                />
              </div>
            </CardContent>
          </motion.div>
        );

      case 6:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <CardHeader>
              <CardTitle>Additional Details</CardTitle>
              <p className="text-gray-600">Any specific requirements or questions?</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="description">Project Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your project, any specific requirements, budget range, or questions..."
                  value={formData.projectDescription}
                  onChange={(e) => updateFormData('projectDescription', e.target.value)}
                  rows={4}
                />
              </div>
              <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600">Upload photos (Optional)</p>
                <p className="text-xs text-gray-500">Drag and drop or click to select</p>
              </div>
            </CardContent>
          </motion.div>
        );

      default:
        return (
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
        );
    }
  };

  if (currentStep > totalSteps) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8">
            {renderStep()}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="font-bold text-2xl text-blue-600">
              Price My Floor
            </Link>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Step {currentStep} of {totalSteps}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 h-2">
        <motion.div
          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2"
          initial={{ width: 0 }}
          animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Form */}
      <div className="py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-xl">
            {renderStep()}
            
            {currentStep <= totalSteps && (
              <div className="p-6 border-t bg-gray-50 flex justify-between">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="flex items-center"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                
                {currentStep === totalSteps ? (
                  <Button onClick={handleSubmit} className="flex items-center">
                    Submit Quote Request
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button onClick={nextStep} className="flex items-center">
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Quote;
