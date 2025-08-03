/// <reference types="@types/google.maps" />
import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';

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

const FALLBACK_GOOGLE_KEY = "YOUR_FALLBACK_KEY_HERE"; // fallback if Supabase function fails

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
  const [googleMapsEnabled, setGoogleMapsEnabled] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const initializeAutocomplete = async () => {
      try {
        console.log('Initializing Google Places Autocomplete...');

        // Fetch API key securely
        const { data, error } = await supabase.functions.invoke('google-maps-config').catch(() => ({ data: null }));
        let apiKey = data?.apiKey || FALLBACK_GOOGLE_KEY;

        const loader = new Loader({
          apiKey,
          version: 'weekly',
          libraries: ['places']
        });

        await loader.load();
        console.log('Google Maps API loaded successfully');

        if (inputRef.current && !autocompleteRef.current) {
          console.log('Creating Google Places Autocomplete instance...');
          autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
            types: usePostalCodeOnly ? ['postal_code'] : ['address'],
            componentRestrictions: { country: 'ca' },
            fields: ['formatted_address', 'address_components', 'geometry']
          });

          autocompleteRef.current.addListener('place_changed', () => {
            const place = autocompleteRef.current?.getPlace();
            console.log('Place selected:', place);

            if (place && place.formatted_address) {
              const addressData: AddressData = {
                formatted_address: place.formatted_address
              };

              if (place.address_components) {
                place.address_components.forEach((component) => {
                  const types = component.types;
                  if (types.includes('street_number')) addressData.street_number = component.long_name;
                  else if (types.includes('route')) addressData.route = component.long_name;
                  else if (types.includes('locality')) addressData.locality = component.long_name;
                  else if (types.includes('administrative_area_level_1')) addressData.administrative_area_level_1 = component.short_name;
                  else if (types.includes('postal_code')) addressData.postal_code = component.long_name;
                  else if (types.includes('country')) addressData.country = component.long_name;
                });
              }

              console.log('Address data extracted:', addressData);
              onChange(place.formatted_address, addressData);
            }
          }); // ✅ closes addListener
        } // ✅ closes if (inputRef.current && !autocompleteRef.current)

        setGoogleMapsEnabled(true);
        setHasError(false);
        setErrorMessage("");
      } catch (err) {
        console.error('Error loading Google Maps:', err);
        setHasError(true);
        setErrorMessage('Google Maps failed to load. Manual input enabled.');
        setGoogleMapsEnabled(false);
      } finally {
        setIsLoaded(true);
      }
    }; // ✅ closes initializeAutocomplete function

    initializeAutocomplete();
  }, [onChange, usePostalCodeOnly]); // ✅ closes useEffect

  return (
    <div className="space-y-1">
      <Input
        ref={inputRef}
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={!isLoaded ? "Loading address search..." : placeholder}
        className={className}
        disabled={false} // always allow manual input
      />
      {googleMapsEnabled && (
        <p className="text-xs text-gray-400 mt-1">Powered by Google Maps</p>
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
