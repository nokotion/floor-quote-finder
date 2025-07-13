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
            types: usePostalCodeOnly ? ['postal_code'] : ['address'],
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
      {isLoaded && !hasError && (
        <div className="flex items-center justify-end mt-1 px-1">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>Powered by</span>
            <svg 
              width="44" 
              height="18" 
              viewBox="0 0 44 18" 
              xmlns="http://www.w3.org/2000/svg"
              className="flex-shrink-0"
            >
              <g fill="none" fillRule="evenodd">
                <path d="M6.734 16.106c2.032 0 3.469-1.18 3.469-2.818 0-1.437-.781-2.262-2.262-2.262H5.445v5.08h1.29zm0-4.23c.937 0 1.575.343 1.575 1.422 0 1.047-.671 1.422-1.575 1.422H6.624v-2.844h.11zm7.344 4.23c1.859 0 3.469-1.016 3.469-2.818 0-1.802-1.61-2.818-3.469-2.818h-2.262v5.636h2.262zm0-4.777c1.047 0 1.859.547 1.859 1.959 0 1.422-.812 1.959-1.859 1.959h-.906v-3.918h.906zm7.453 4.887c1.938 0 3.61-1.422 3.61-2.928 0-1.506-1.672-2.928-3.61-2.928s-3.61 1.422-3.61 2.928c0 1.506 1.672 2.928 3.61 2.928zm0-.859c-1.25 0-2.195-.906-2.195-2.069 0-1.172.945-2.078 2.195-2.078s2.195.906 2.195 2.078c0 1.163-.945 2.069-2.195 2.069zM31.766 16.106V11.32l2.709 4.786h1.172V10.47h-1.172v4.23l-2.543-4.23h-1.438v5.636h1.272zm7.547 0c1.859 0 3.469-1.016 3.469-2.818 0-1.802-1.61-2.818-3.469-2.818h-2.262v5.636h2.262zm0-4.777c1.047 0 1.859.547 1.859 1.959 0 1.422-.812 1.959-1.859 1.959h-.906v-3.918h.906z" 
                  fill="#737373"
                />
                <path d="M17.813 9.812c-.328 0-.594-.266-.594-.594s.266-.594.594-.594.594.266.594.594-.266.594-.594.594zm-5.859 0c-.328 0-.594-.266-.594-.594s.266-.594.594-.594.594.266.594.594-.266.594-.594.594z" 
                  fill="#4285F4"
                />
                <path d="M21.609 12.422c-.89 2.234-3.047 3.828-5.609 3.828-3.328 0-6.015-2.687-6.015-6.015C10 7.359 12.672 4.672 16 4.672c1.641 0 3.125.656 4.203 1.719l-1.797 1.797C17.719 7.594 16.922 7.234 16 7.234c-1.875 0-3.375 1.516-3.375 3.375s1.5 3.375 3.375 3.375c1.453 0 2.672-.781 3.156-1.891h-3.156v-2.25h5.609c.094.469.141.953.141 1.453 0 .328-.016.656-.063.984z" 
                  fill="#4285F4"
                />
              </g>
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