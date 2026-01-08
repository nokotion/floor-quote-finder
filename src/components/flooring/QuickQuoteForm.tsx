import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AddressAutocomplete, { AddressData } from "@/components/ui/address-autocomplete";
import { projectSizes } from "@/constants/flooringData";
import { useNavigate } from "react-router-dom";
import { GlassCard } from "@/components/ui/glass-card";
import { Sparkles } from "lucide-react";

interface Brand {
  id: string;
  name: string;
}

interface QuickQuoteFormProps {
  brands: Brand[];
  brandsLoading: boolean;
}

const QuickQuoteForm: React.FC<QuickQuoteFormProps> = ({ brands, brandsLoading }) => {
  const [selectedBrand, setSelectedBrand] = useState("");
  const [projectSize, setProjectSize] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [addressData, setAddressData] = useState<AddressData | null>(null);
  const [postalCodeError, setPostalCodeError] = useState("");
  const [addressError, setAddressError] = useState("");
  const [loading, setLoading] = useState(false);
  const [addressProcessing, setAddressProcessing] = useState(false);
  const [hasValidGoogleSelection, setHasValidGoogleSelection] = useState(false);
  const navigate = useNavigate();

  console.log("QuickQuoteForm - Brands received:", brands?.length, "Loading:", brandsLoading);

  const validateAddress = (address: string, data?: AddressData): boolean => {
    if (data?.fromGoogleSuggestion && data?.postal_code) {
      return true;
    }
    if (data?.fromGoogleSuggestion) {
      return true;
    }
    const canadianPostalPattern = /[A-Z]\d[A-Z]\s?\d[A-Z]\d/i;
    const hasPostalCode = canadianPostalPattern.test(address);
    const isReasonablyComplete = address.length > 10 && address.includes(" ");
    return hasPostalCode || isReasonablyComplete;
  };

  const handleAddressChange = (address: string, data?: AddressData) => {
    console.log("handleAddressChange called:", { 
      address, 
      fromGoogle: data?.fromGoogleSuggestion, 
      postalCode: data?.postal_code,
      isProcessing: data?.isProcessing 
    });

    setPostalCode(address);
    setAddressData(data || null);
    setPostalCodeError("");
    
    if (data?.isProcessing) {
      console.log("Still processing, skipping validation");
      setHasValidGoogleSelection(false);
      setAddressError("");
      return;
    }

    if (data?.fromGoogleSuggestion && !data.isProcessing) {
      console.log("Google suggestion selected, marking as valid");
      setHasValidGoogleSelection(true);
      setAddressError("");
      return;
    }

    setHasValidGoogleSelection(false);
    
    if (address.length > 3) {
      const isValid = validateAddress(address, data);
      console.log("Manual entry validation:", { address, isValid });
      if (!isValid) {
        setAddressError("Please select an address from the suggestions or enter a complete Canadian address");
      } else {
        setAddressError("");
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBrand || !projectSize || !postalCode) return;

    if (!validateAddress(postalCode, addressData)) {
      setAddressError("Please select an address from the suggestions or enter a complete Canadian address");
      return;
    }

    setLoading(true);
    const params = new URLSearchParams({
      brand: selectedBrand,
      size: projectSize,
      postal: postalCode.toUpperCase(),
    });
    if (addressData?.formatted_address) params.append("formatted", addressData.formatted_address);

    navigate(`/quote?${params.toString()}`);
  };

  const isFormValid = selectedBrand && 
    projectSize && 
    postalCode && 
    !addressProcessing && 
    !addressError && 
    (hasValidGoogleSelection || validateAddress(postalCode, addressData));

  return (
    <div className="max-w-4xl mx-auto">
      <GlassCard variant="prominent" className="overflow-hidden">
        {/* Decorative gradient border at top */}
        <div className="h-1 bg-gradient-to-r from-orange-400 via-rose-500 to-red-500" />
        
        <CardHeader className="pb-4">
          <CardTitle className="text-center text-2xl font-bold flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-orange-500" />
            <span className="text-gradient">Quick Quote Form</span>
            <Sparkles className="w-5 h-5 text-orange-500" />
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Brand Dropdown */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Preferred Brand</Label>
                <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                  <SelectTrigger className="h-12 bg-white/50 border-white/50 hover:bg-white/70 transition-colors focus:ring-2 focus:ring-orange-500/30">
                    <SelectValue placeholder={brandsLoading ? "Loading brands..." : "Select brand"} />
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

              {/* Project Size */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Project Size</Label>
                <Select value={projectSize} onValueChange={setProjectSize}>
                  <SelectTrigger className="h-12 bg-white/50 border-white/50 hover:bg-white/70 transition-colors focus:ring-2 focus:ring-orange-500/30">
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

              {/* Address */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Address</Label>
                <AddressAutocomplete
                  value={postalCode}
                  onChange={handleAddressChange}
                  onLoadingChange={setAddressProcessing}
                  placeholder="Enter address or postal code"
                  error={addressError}
                />
                {postalCodeError && <p className="text-sm text-destructive">{postalCodeError}</p>}
              </div>
            </div>

            <div className="text-center pt-2">
              <Button
                type="submit"
                size="lg"
                disabled={!isFormValid || loading || addressProcessing}
                className="px-10 py-6 text-lg font-semibold bg-gradient-to-r from-orange-500 via-rose-500 to-red-500 hover:from-orange-600 hover:via-rose-600 hover:to-red-600 disabled:opacity-50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-orange-500/25 rounded-xl"
              >
                {addressProcessing ? "Processing address..." : loading ? "Processing..." : "Get My Quote →"}
              </Button>
            </div>
          </form>
        </CardContent>
      </GlassCard>
    </div>
  );
};

export default QuickQuoteForm;
