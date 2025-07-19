
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
  usePostalCodeOnly?: boolean;
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
  const [googleMapsEnabled, setGoogleMapsEnabled] = useState(false);

  useEffect(() => {
    const initializeAutocomplete = async () => {
      try {
        console.log('Attempting to initialize Google Places Autocomplete...');
        
        // Try to get Google Maps API key from environment or edge function
        const response = await fetch('/api/google-maps-config');
        let apiKey = '';
        
        if (response.ok) {
          const config = await response.json();
          apiKey = config.apiKey;
        }
        
        if (!apiKey) {
          console.log('Google Maps API key not configured - using fallback input mode');
          setHasError(true);
          setErrorMessage('Enter your complete address or postal code');
          setIsLoaded(true);
          return;
        }

        console.log('Loading Google Maps API...');
        const loader = new Loader({
          apiKey: apiKey,
          version: 'weekly',
          libraries: ['places']
        });

        await loader.load();
        console.log('Google Maps API loaded successfully');
        
        if (inputRef.current && !autocompleteRef.current) {
          autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
            types: usePostalCodeOnly ? ['postal_code'] : ['address'],
            componentRestrictions: { country: 'ca' },
            fields: ['formatted_address', 'address_components', 'geometry']
          });

          autocompleteRef.current.addListener('place_changed', () => {
            const place = autocompleteRef.current?.getPlace();
            if (place && place.formatted_address) {
              const addressData: AddressData = {
                formatted_address: place.formatted_address
              };

              if (place.address_components) {
                place.address_components.forEach((component) => {
                  const types = component.types;
                  if (types.includes('street_number')) {
                    addressData.street_number = component.long_name;
                  } else if (types.includes('route')) {
                    addressData.route = component.long_name;
                  } else if (types.includes('locality')) {
                    addressData.locality = component.long_name;
                  } else if (types.includes('administrative_area_level_1')) {
                    addressData.administrative_area_level_1 = component.short_name;
                  } else if (types.includes('postal_code')) {
                    addressData.postal_code = component.long_name;
                  } else if (types.includes('country')) {
                    addressData.country = component.long_name;
                  }
                });
              }

              onChange(place.formatted_address, addressData);
            }
          });
          
          console.log('Google Places Autocomplete initialized successfully');
          setGoogleMapsEnabled(true);
        }
        setIsLoaded(true);
        setHasError(false);
      } catch (error) {
        console.error('Error loading Google Maps:', error);
        setHasError(true);
        setErrorMessage('Google Maps failed to load. You can still enter your address manually.');
        setIsLoaded(true);
      }
    };

    const timeoutId = setTimeout(initializeAutocomplete, 100);
    return () => clearTimeout(timeoutId);
  }, [onChange, usePostalCodeOnly]);

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
      {isLoaded && googleMapsEnabled && (
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
