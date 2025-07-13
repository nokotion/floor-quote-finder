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
}

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  value,
  onChange,
  onBlur,
  placeholder = "Start typing your address...",
  className = "",
  id
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const initializeAutocomplete = async () => {
      try {
        console.log('Initializing Google Places Autocomplete...');
        const loader = new Loader({
          apiKey: 'AIzaSyAHCJ9TJj7wLc5Gk_7zmYq9gthe71o3x50',
          version: 'weekly',
          libraries: ['places']
        });

        await loader.load();
        console.log('Google Maps API loaded successfully');
        
        if (inputRef.current && !autocompleteRef.current) {
          autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
            types: ['address'],
            componentRestrictions: { country: 'ca' }, // Restrict to Canada
            fields: ['formatted_address', 'address_components', 'geometry']
          });

          autocompleteRef.current.addListener('place_changed', () => {
            const place = autocompleteRef.current?.getPlace();
            if (place && place.formatted_address) {
              const addressData: AddressData = {
                formatted_address: place.formatted_address
              };

              // Parse address components
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
        }
        setIsLoaded(true);
        setHasError(false);
      } catch (error) {
        console.error('Error loading Google Maps:', error);
        setHasError(true);
        setErrorMessage('Google Maps failed to load. You can still enter your address manually.');
        setIsLoaded(true); // Still set to true so the input is usable as fallback
      }
    };

    // Add a small delay to prevent race conditions
    const timeoutId = setTimeout(initializeAutocomplete, 100);
    return () => clearTimeout(timeoutId);
  }, [onChange]);

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
      {hasError && errorMessage && (
        <p className="text-sm text-muted-foreground">{errorMessage}</p>
      )}
    </div>
  );
};

export default AddressAutocomplete;
export { AddressAutocomplete };
export type { AddressData };