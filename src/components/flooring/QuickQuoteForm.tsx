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
  const navigate = useNavigate();

  // Add logging for debugging brands
  console.log("QuickQuoteForm - Brands received:", brands?.length, "Loading:", brandsLoading);

  // Validate if address is complete
  const validateAddress = (address: string, data?: AddressData): boolean => {
    // If Google suggestion was selected, it's valid
    if (data?.fromGoogleSuggestion) {
      return true;
    }

    // For manual entry, check if it looks like a complete Canadian address
    // Should contain at least postal code pattern or be reasonably complete
    const canadianPostalPattern = /[A-Z]\d[A-Z]\s?\d[A-Z]\d/i;
    const hasPostalCode = canadianPostalPattern.test(address);
    const isReasonablyComplete = address.length > 10 && address.includes(" ");

    return hasPostalCode || isReasonablyComplete;
  };

  const handleAddressChange = (address: string, data?: AddressData) => {
    setPostalCode(address);
    setAddressData(data || null);
    setPostalCodeError("");
    setAddressError("");

    // Validate address if user has typed something substantial
    if (address.length > 3 && !validateAddress(address, data)) {
      if (data?.fromGoogleSuggestion === false || (!data && address.length > 3)) {
        setAddressError("Please select an address from the suggestions or enter a complete Canadian address");
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

  const isFormValid = selectedBrand && projectSize && postalCode && !addressError && validateAddress(postalCode, addressData);

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
                  disabled={!isFormValid || loading}
                  className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:opacity-50"
                >
                  {loading ? "Processing..." : "Get My Quote"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
    </div>
  );
};

export default QuickQuoteForm;
