
import { useState, useRef, useEffect, memo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  brandsLoading?: boolean;
  error?: string | null;
  onRetry?: () => Promise<void>;
}

export const QuickQuoteForm = memo(({ brands: propBrands, brandsLoading = false, error, onRetry }: QuickQuoteFormProps) => {
  const componentId = useRef(`FORM_${Math.random().toString(36).substr(2, 9)}`);
  const renderCount = useRef(0);
  renderCount.current++;
  
  console.log(`[${componentId.current}] 📥 QuickQuoteForm (FLOORING FOLDER) render #${renderCount.current} - brands prop:`, { 
    brandsCount: propBrands?.length, 
    brandsLoading, 
    firstBrand: propBrands?.[0]?.name,
    allBrands: propBrands?.map(b => b.name).slice(0, 10)
  });
  
  // Track component lifecycle
  useEffect(() => {
    console.log(`[${componentId.current}] 🎬 QuickQuoteForm MOUNTED`);
    return () => {
      console.log(`[${componentId.current}] 🧹 QuickQuoteForm UNMOUNTING`);
    };
  }, []);
  
  // Track prop changes
  useEffect(() => {
    console.log(`[${componentId.current}] 🔄 Brands prop changed:`, propBrands?.length, "loading:", brandsLoading);
  }, [propBrands, brandsLoading]);
  
  console.log(`[${componentId.current}] 🎯 Dropdown rendering brands:`, propBrands?.map(b => b.name));
  
  const [selectedBrand, setSelectedBrand] = useState("");
  const [projectSize, setProjectSize] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [addressData, setAddressData] = useState<AddressData | null>(null);
  const [postalCodeError, setPostalCodeError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fallbackBrands, setFallbackBrands] = useState<Brand[]>([]);
  const [fallbackLoading, setFallbackLoading] = useState(false);
  const navigate = useNavigate();

  // Fallback direct fetch for brands if context fails
  const fetchBrandsFallback = async () => {
    if (fallbackBrands.length > 0) return; // Already have fallback brands
    
    console.log("🚨 QuickQuoteForm: Attempting fallback brand fetch...");
    setFallbackLoading(true);
    
    try {
      const { data, error } = await supabase
        .from("flooring_brands")
        .select("id, name")
        .order("name")
        .limit(50);
        
      if (data && !error) {
        console.log("✅ QuickQuoteForm: Fallback fetch successful:", data.length, "brands");
        setFallbackBrands(data);
      } else {
        console.error("❌ QuickQuoteForm: Fallback fetch failed:", error);
      }
    } catch (err) {
      console.error("💥 QuickQuoteForm: Fallback fetch error:", err);
    } finally {
      setFallbackLoading(false);
    }
  };

  // Trigger fallback if context has error and no brands
  useEffect(() => {
    if (error && propBrands.length === 0 && !brandsLoading) {
      fetchBrandsFallback();
    }
  }, [error, propBrands.length, brandsLoading]);

  // Use fallback brands if main brands failed
  const effectiveBrands = propBrands.length > 0 ? propBrands : fallbackBrands;
  const effectiveLoading = brandsLoading || (fallbackLoading && effectiveBrands.length === 0);
  const hasError = error && effectiveBrands.length === 0;

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

  console.log("🎯 About to render brand dropdown. Loading?", brandsLoading, "Brands count:", propBrands?.length);

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
                   <SelectTrigger className="h-12 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                     <SelectValue placeholder={effectiveLoading ? "Loading brands..." : "Select brand"} />
                   </SelectTrigger>
                   <SelectContent className="bg-white border border-gray-200 shadow-lg z-[9999]">
                     {effectiveLoading ? (
                       <SelectItem disabled value="loading" className="font-medium text-gray-500">
                         Loading brands...
                       </SelectItem>
                     ) : hasError ? (
                       <SelectItem disabled value="error" className="font-medium text-red-500">
                         Error loading brands
                       </SelectItem>
                     ) : effectiveBrands && effectiveBrands.length > 0 ? (
                       effectiveBrands.map((brand) => {
                         console.log("🎯 Rendering brand option:", brand);
                         return (
                           <SelectItem key={brand.id} value={brand.id} className="font-medium text-gray-900 hover:bg-gray-100">
                             {brand.name}
                           </SelectItem>
                         );
                       })
                     ) : (
                       <SelectItem disabled value="no-brands" className="font-medium text-gray-500">
                         No brands available
                       </SelectItem>
                     )}
                   </SelectContent>
                 </Select>
                 {hasError && (
                   <div className="space-y-2 mt-2">
                     {onRetry && (
                       <Button 
                         type="button" 
                         variant="outline" 
                         size="sm" 
                         onClick={onRetry}
                         className="text-xs w-full"
                       >
                         Retry Loading Brands
                       </Button>
                     )}
                     <Button 
                       type="button" 
                       variant="outline" 
                       size="sm" 
                       onClick={fetchBrandsFallback}
                       className="text-xs w-full"
                       disabled={fallbackLoading}
                     >
                       {fallbackLoading ? "Loading..." : "Try Direct Fetch"}
                     </Button>
                   </div>
                 )}
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
});

QuickQuoteForm.displayName = 'QuickQuoteForm';
