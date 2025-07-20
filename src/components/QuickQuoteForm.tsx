
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Zap, ArrowLeft } from "lucide-react";
import { formatAndValidatePostalCode, validatePostalCode } from "@/utils/postalCodeUtils";
import { AddressAutocomplete, AddressData } from "@/components/ui/address-autocomplete";
import { projectSizes } from "@/constants/flooringData";

interface Brand {
  id: string;
  name: string;
}

interface QuickQuoteFormProps {
  onBack?: () => void;
  showBackButton?: boolean;
}

const flooringTypes = [
  { value: 'hardwood', label: 'Hardwood' },
  { value: 'laminate', label: 'Laminate' },
  { value: 'vinyl', label: 'Vinyl/LVP' },
  { value: 'tile', label: 'Tile' },
  { value: 'carpet', label: 'Carpet' },
  { value: 'engineered', label: 'Engineered Wood' },
  { value: 'other', label: 'Other' }
];

const QuickQuoteForm = ({ onBack, showBackButton = true }: QuickQuoteFormProps) => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [projectSize, setProjectSize] = useState("");
  const [flooringType, setFlooringType] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [addressData, setAddressData] = useState<AddressData | null>(null);
  const [postalCodeError, setPostalCodeError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

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

  const handleAddressChange = (address: string, data?: AddressData) => {
    if (data && data.postal_code) {
      // Full address selected from Google Places
      setAddressData(data);
      setPostalCode(data.postal_code);
      setPostalCodeError("");
    } else if (address) {
      // Manual entry - check if it's a postal code or partial address
      if (validatePostalCode(address)) {
        const formatted = formatAndValidatePostalCode(address, postalCode);
        setPostalCode(formatted);
        setAddressData(null);
        setPostalCodeError("");
      } else {
        // Allow partial addresses but don't validate yet
        setPostalCode(address);
        setAddressData(null);
        if (postalCodeError) {
          setPostalCodeError("");
        }
      }
    }
  };

  const handlePostalCodeBlur = () => {
    if (postalCode && !validatePostalCode(postalCode)) {
      setPostalCodeError("Please enter a valid Canadian postal code (e.g., M5V 3A8)");
    } else {
      setPostalCodeError("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (postalCode && !validatePostalCode(postalCode)) {
      setPostalCodeError("Please enter a valid Canadian postal code (e.g., M5V 3A8)");
      return;
    }
    
    if (!selectedBrand || !projectSize || !flooringType || !postalCode) return;

    setIsLoading(true);
    
    const params = new URLSearchParams({
      brand: selectedBrand,
      size: projectSize,
      flooring_type: flooringType,
      postal: postalCode.toUpperCase()
    });

    // Add address components if available from Google Places
    if (addressData) {
      if (addressData.route) params.append('street', addressData.route);
      if (addressData.locality) params.append('city', addressData.locality);
      if (addressData.administrative_area_level_1) params.append('province', addressData.administrative_area_level_1);
      if (addressData.formatted_address) params.append('formatted_address', addressData.formatted_address);
    }

    navigate(`/quote?${params.toString()}`);
  };

  const isFormValid = selectedBrand && projectSize && flooringType && postalCode && validatePostalCode(postalCode);

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          {showBackButton && onBack && (
            <Button 
              variant="ghost" 
              onClick={onBack}
              className="mb-6 hover:bg-gray-100"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Options
            </Button>
          )}
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Zap className="w-4 h-4" />
            Quick Quote
          </div>
          <h2 className="text-3xl font-bold mb-4">Get Started in Seconds</h2>
          <p className="text-xl text-gray-600">Tell us about your project and we'll connect you with the right retailers</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
            <CardHeader>
              <CardTitle className="text-center text-2xl">Quick Quote Form</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <Label htmlFor="brand">Preferred Brand</Label>
                    <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                      <SelectTrigger>
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

                  <div>
                    <Label htmlFor="flooring-type">Flooring Type</Label>
                    <Select value={flooringType} onValueChange={setFlooringType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {flooringTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="size">Project Size</Label>
                    <Select value={projectSize} onValueChange={setProjectSize}>
                      <SelectTrigger>
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

                  <div>
                    <Label htmlFor="postal">Address</Label>
                    <AddressAutocomplete
                      value={postalCode}
                      onChange={handleAddressChange}
                      onBlur={handlePostalCodeBlur}
                      placeholder="Enter your address or postal code"
                      className={postalCodeError ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
                    />
                    {postalCodeError && (
                      <p className="text-sm text-red-600 mt-1">{postalCodeError}</p>
                    )}
                    {addressData && (
                      <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <p className="text-sm text-green-700 font-medium">
                            Address confirmed: {addressData.formatted_address}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-center">
                  <Button 
                    type="submit" 
                    size="lg" 
                    disabled={!isFormValid || isLoading}
                    className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:opacity-50"
                  >
                    {isLoading ? "Getting Your Quote..." : "Get My Competitive Quotes"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

export default QuickQuoteForm;
