
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { formatAndValidatePostalCode, validatePostalCode } from "@/utils/postalCodeUtils";
import { AddressAutocomplete, AddressData } from "@/components/ui/address-autocomplete";
import { projectSizes } from "@/constants/flooringData";
import { supabase } from "@/integrations/supabase/client";

interface Brand {
  id: string;
  name: string;
}

interface QuickQuoteFormProps {
  brands: Brand[];
}

export const QuickQuoteForm = ({ brands }: QuickQuoteFormProps) => {
  console.log('🏠 QuickQuoteForm rendered with brands:', brands?.length || 0, 'brands');
  console.log('🔍 Brand names:', brands?.map(b => b.name).slice(0, 5));
  
  // Direct test query to debug Supabase connection
  useEffect(() => {
    const testQuery = async () => {
      console.log('🧪 Testing direct Supabase query from QuickQuoteForm...');
      try {
        const { data, error } = await supabase
          .from('flooring_brands')
          .select('id, name')
          .limit(3);
        console.log('🧪 Direct query result:', { data, error });
      } catch (err) {
        console.error('🧪 Direct query failed:', err);
      }
    };
    testQuery();
  }, []);
  
  const [selectedBrand, setSelectedBrand] = useState("");
  const [projectSize, setProjectSize] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [addressData, setAddressData] = useState<AddressData | null>(null);
  const [postalCodeError, setPostalCodeError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

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

  const handleQuickQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate postal code on submit
    if (postalCode && !validatePostalCode(postalCode)) {
      setPostalCodeError("Please enter a valid Canadian postal code (e.g., M5V 3A8)");
      return;
    }
    
    if (!selectedBrand || !projectSize || !postalCode) return;

    setIsLoading(true);
    
    const params = new URLSearchParams({
      brand: selectedBrand,
      size: projectSize,
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

  const isFormValid = selectedBrand && projectSize && postalCode && validatePostalCode(postalCode);

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="shadow-xl border-0 bg-white">
        <CardContent className="p-4">
          <form onSubmit={handleQuickQuoteSubmit} className="space-y-4">
            {/* Desktop: Horizontal Layout, Mobile: Vertical Stack */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label htmlFor="brand" className="text-sm font-semibold text-gray-800 mb-2 block">
                  Preferred Brand
                </Label>
                <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                  <SelectTrigger className="h-12 text-base focus:ring-2 focus:ring-orange-500 focus:border-orange-500 border-gray-200 font-medium">
                    <SelectValue placeholder="Select brand" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                    {brands.map((brand) => (
                      <SelectItem key={brand.id} value={brand.name} className="font-medium">
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="size" className="text-sm font-semibold text-gray-800 mb-2 block">
                  Project Size (sq ft)
                </Label>
                <Select value={projectSize} onValueChange={setProjectSize}>
                  <SelectTrigger className="h-12 text-base focus:ring-2 focus:ring-orange-500 focus:border-orange-500 border-gray-200 font-medium">
                    <SelectValue placeholder="Select size" />
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

              <div>
                <Label htmlFor="postal" className="text-sm font-semibold text-gray-800 mb-2 block">
                  Address
                </Label>
                <AddressAutocomplete
                  value={postalCode}
                  onChange={handleAddressChange}
                  placeholder="Enter your address or postal code"
                  className={`h-12 text-base focus:ring-2 focus:ring-orange-500 focus:border-orange-500 border-gray-200 font-medium ${
                    postalCodeError ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                  }`}
                />
                {postalCodeError && (
                  <p className="text-sm text-red-600 mt-1 font-medium">{postalCodeError}</p>
                )}
                {addressData && (
                  <p className="text-sm text-green-600 mt-1 font-medium">✓ Address confirmed: {addressData.formatted_address}</p>
                )}
              </div>
            </div>

            <div className="text-center pt-2">
              <Button 
                type="submit" 
                size="lg" 
                disabled={!isFormValid || isLoading}
                className={`px-10 py-4 text-base font-semibold bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:opacity-50 transition-all duration-300 shadow-lg ${
                  isFormValid && !isLoading 
                    ? "transform hover:scale-105 hover:shadow-xl" 
                    : "cursor-not-allowed"
                } ${isLoading ? "animate-pulse" : ""}`}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Getting Your Quote...
                  </div>
                ) : (
                  "Get My Competitive Quotes"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
