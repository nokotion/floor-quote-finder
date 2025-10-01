import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import AddressAutocomplete, { AddressData } from "@/components/ui/address-autocomplete";
import { projectSizes } from "@/constants/flooringData";
import { useNavigate } from "react-router-dom";

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

  // Add logging for debugging brands
  console.log("QuickQuoteForm - Brands received:", brands?.length, "Loading:", brandsLoading);

  // Validate if address is complete
  const validateAddress = (address: string, data?: AddressData): boolean => {
    // If Google suggestion was selected and has postal code, it's valid
    if (data?.fromGoogleSuggestion && data?.postal_code) {
      return true;
    }

    // If Google suggestion was selected but no postal code, still allow it 
    // (Quote page will handle postal code extraction as fallback)
    if (data?.fromGoogleSuggestion) {
      return true;
    }

    // For manual entry, check if it looks like a complete Canadian address
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
    
    // Don't validate while Google Places is processing
    if (data?.isProcessing) {
      console.log("Still processing, skipping validation");
      setHasValidGoogleSelection(false);
      setAddressError("");
      return;
    }

    // If Google suggestion was selected and processing is complete, mark as valid
    if (data?.fromGoogleSuggestion && !data.isProcessing) {
      console.log("Google suggestion selected, marking as valid");
      setHasValidGoogleSelection(true);
      setAddressError("");
      return;
    }

    // Manual entry - not from Google
    setHasValidGoogleSelection(false);
    
    // Only validate manual entry after user has typed something substantial
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

    // Validate address before submission
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

  // Form validation - use the flag set immediately when Google selection is made
  const isFormValid = selectedBrand && 
    projectSize && 
    postalCode && 
    !addressProcessing && 
    !addressError && 
    (hasValidGoogleSelection || validateAddress(postalCode, addressData));

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Quick Quote Form</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Brand Dropdown */}
                <div>
                  <Label>Preferred Brand</Label>
                  <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                    <SelectTrigger>
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
                <div>
                  <Label>Project Size</Label>
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

                {/* Address */}
                <div>
                  <Label>Address</Label>
                  <AddressAutocomplete
                    value={postalCode}
                    onChange={handleAddressChange}
                    onLoadingChange={setAddressProcessing}
                    placeholder="Enter address or postal code"
                    error={addressError}
                  />
                  {postalCodeError && <p className="text-sm text-red-500">{postalCodeError}</p>}
                </div>
              </div>

              <div className="text-center">
                <Button
                  type="submit"
                  size="lg"
                  disabled={!isFormValid || loading || addressProcessing}
                  className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:opacity-50"
                >
                  {addressProcessing ? "Processing address..." : loading ? "Processing..." : "Get My Quote"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
    </div>
  );
};

export default QuickQuoteForm;
