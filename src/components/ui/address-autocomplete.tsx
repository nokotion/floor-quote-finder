/// <reference types="@types/google.maps" />
import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Input } from '@/components/ui/input';

interface AddressData {
  formatted_address: string;
  street_number?: string;
  route?: string;
  locality?: string;
  administrative_area_level_1?: string;
  postal_code?: string;
  country?: string;
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (address: string, addressData?: AddressData) => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
  id?: string;
  usePostalCodeOnly?: boolean; // New prop to control postal code vs full address
}

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  value,
  onChange,
  onBlur,
  placeholder = "Start typing your address...",
  className = "",
  id,
  usePostalCodeOnly = false
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    // Skip Google Maps initialization for now due to API key configuration issues
    // This component will work as a regular input field until Google Maps API is properly configured
    console.log('Google Maps API disabled - using fallback input mode');
    setHasError(true);
    setErrorMessage('Enter your complete address or postal code');
    setIsLoaded(true);
  }, []);

  // Handle manual input changes when Google Maps is not available
  const handleManualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="space-y-1">
      <Input
        ref={inputRef}
        id={id}
        value={value}
        onChange={handleManualChange}
        onBlur={onBlur}
        placeholder={
          !isLoaded 
            ? "Loading address search..." 
            : hasError 
              ? "Enter your address manually"
              : placeholder
        }
        className={className}
        disabled={!isLoaded}
      />
      {isLoaded && !hasError && (
        <div className="flex items-center justify-end mt-1 px-1">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>powered by</span>
            <svg 
              width="65" 
              height="12" 
              viewBox="0 0 65 12" 
              xmlns="http://www.w3.org/2000/svg"
              className="flex-shrink-0"
            >
              <text x="0" y="10" fontSize="10" fontFamily="Arial, sans-serif">
                <tspan fill="#4285F4">G</tspan>
                <tspan fill="#EA4335">o</tspan>
                <tspan fill="#FBBC04">o</tspan>
                <tspan fill="#4285F4">g</tspan>
                <tspan fill="#34A853">l</tspan>
                <tspan fill="#EA4335">e</tspan>
              </text>
            </svg>
          </div>
        </div>
      )}
      {hasError && errorMessage && (
        <p className="text-sm text-muted-foreground">{errorMessage}</p>
      )}
    </div>
  );
};

export default AddressAutocomplete;
export { AddressAutocomplete };
export type { AddressData };