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
        <div className="flex justify-end">
          <img
            src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAAAgCAYAAACinX6EAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAABmJLR0QA/wD/AP+gvaeTAAAAB3RJTUUH4QsXEgc4y3KhBAAABXZJREFUWMPtlk1sHEcVx3/v9cysZ2e9u3bseOPEiRPHjmNCHCdOiBPiJCQhCSFNSEgRKAEOCAEHJC5wQEJc4MCBAwcOHLggceCAhIRAQgKBhEDiA5IQJ3HiOI4d22vH3vXH7Mx0d3U/OOxMb7u36zXkg4NUtXu6X7/3r/d6+tUIN2cWBSIWBSIW/88sIl/xpJVxgKzUMhO1xhAOyQm2yPe9wBB8P/SzaXA7KmwdKhAOxQH/C5XqNMhTz99RfEQ11ItWFdaIjbMnx5vM8v6hAXyxbHO9HvSsG0+nQSI+tVWkWZLxOKIV9Py+YL7Vy2itGDyhlC6Ylu1ffrQhlfKDOhDmOVOKGqINZCygEfTAVQDuFwZSgCqECooQQGwLrJPOeGWOKKJMDdM8fvKJE7c6bU9Kn/wBgJ2BVAp6nL9c4EH5xFRVONODAXI7v0DQGQ/1MpRCQrKpDIMIJm1jZmw0tgV2xHxsLy7ceWrx5bqh2iZsNY4tRJRSbEgbILJGRAjp6O6Ar/U4XfgegQkJdR/aZRxnrCaLxWCHNTSKEDYO6kTvf/6upj4vvfLKyXue/hOEtZAfJQvQQrNGBBHFz/3cKRKNd1CtglqbNALdNPuqTSpZxEqjS5P+8Pfn9HL7TU+v5sBj7aeqh/q1tBDCJ9BNhAkQxocE2DbEKSBUe2Bq8FdxOIq1Q9iUhLaHaGY5JGOU9nBSKmZjgZYWEBBVagYlhcIhCCcvRfKJhPpQDyXJeW1sFBZQnTJ9uxSDNRVUNFFZdX5DggfKDWlX0yNFGF9PqxqOyKoGHKUwJkBWNqmVG9wVCO6v1TG1Gpe2bsNNxAhcFAHCT9gKG/+7e7QlGe8/4DLSLqFLkzidxUmV6OVdZKdMNyLnuKqC5xK6Hi4oD1F2uh1fq8m2Dh1eBaW4MjIC7TpU33qbluu24L+MlGUqP2r/1eFfOKhSNKlSszVbDZsL5T9sGBrvGQ6oFYQlhgxNW0sblKQhhvv8mJ8wHPR7sA39HLt9GNq61F7YrGwtB4Kxr/y4nJD7BhH8fvF8H4w8rJOWgjOZz/0mOaB7fAA/4dCMR7Tcf2LZn8oHwgBvjIwEtW5maNBKlFgKCMj8x9ZtpHMjkTrlsVeV6m+sLj1kU7CdCaZm3JvFTXi8XJcHJ2Z3EgS7QIDbxNZx6xhO1BcVhEKgfvpojhcXO7R+6nOhAE+cO4FjU5oF8V12sn9MrC2z2sKcfYvU8e+gq+fJzf8S55vvwL/7DGrbt1GVbRT/9B/kU7+H3hq8eBrv2aOoPV1s1/O+3d7lnKqvjxM4a0gt7Q6A8O+7u0iNj7zfOgawCm9bWKTQPL5UKNBcKTfmLyaFqMVGtNrEsj6HEUcq7+tKZuRGdLUJN1uQgOkjnYrffXhHVJlYJo6VYT1Eexm6UYL/zOPo8hkT/cOYPfYJp5xbL4J0u4hWF4UPVA4yQWa+rEQ3gBGEKkPW8w5vFJgL8s5PnmDl6mUrr7WDOr0Fq8DQQkSf2bQxBIJRZmQo5ym6C+aRAOgDOgbvJhP9DnSM1oeRAQWcAOgD3jSa/wG6S6jlFQEfgKO8qVl+HxS6HQ6TxGCGYuBJEwPxTRjAhsDeXFgz8cAJ5I9xA2oObJDTlRWnZfwTTr97ZevfPl6Ss8ZA+K3e8dAy9+P9R9gF+Qy78WPG/RNwg/8KlNi2HyNwI9AEtFq4rLQ8LwWDPvxV25Bb1Btp5p7s/3qZP43qb3F0dvEtjrg5s+gDOgw8afOQ8xgAAAAASUVORK5CYII="
            alt="Powered by Google"
            className="h-4"
          />
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