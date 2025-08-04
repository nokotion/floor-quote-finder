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
        console.log('Initializing Google Places Autocomplete...');
        const { data, error } = await supabase.functions.invoke('google-maps-config');

        if (error || !data?.apiKey) {
          console.error("Google Maps API key missing, fallback to manual input.");
          setHasError(true);
          setErrorMessage("Enter your address manually.");
          setIsLoaded(true);
          return;
        }

        const loader = new Loader({
          apiKey: data.apiKey,
          version: 'weekly',
          libraries: ['places'],
        });

        await loader.load();
        console.log("Google Maps API loaded successfully");

        if (inputRef.current && !autocompleteRef.current) {
          autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
            types: usePostalCodeOnly ? ['postal_code'] : ['address'],
            componentRestrictions: { country: 'ca' },
            fields: ['formatted_address', 'address_components', 'geometry']
          });

          autocompleteRef.current.addListener("place_changed", () => {
            const place = autocompleteRef.current?.getPlace();
            if (!place || !place.formatted_address) return;

            const addressData: AddressData = { formatted_address: place.formatted_address };

            place.address_components?.forEach((c) => {
              const types = c.types;
              if (types.includes('street_number')) addressData.street_number = c.long_name;
              else if (types.includes('route')) addressData.route = c.long_name;
              else if (types.includes('locality')) addressData.locality = c.long_name;
              else if (types.includes('administrative_area_level_1')) addressData.administrative_area_level_1 = c.short_name;
              else if (types.includes('postal_code')) addressData.postal_code = c.long_name;
              else if (types.includes('country')) addressData.country = c.long_name;
            });

            console.log("Address data extracted:", addressData);
            onChange(place.formatted_address, addressData);
          });

          setGoogleMapsEnabled(true);
        }

        setIsLoaded(true);
        setHasError(false);
        setErrorMessage("");
      } catch (err) {
        console.error("Error loading Google Maps:", err);
        setHasError(true);
        setErrorMessage("Google Maps failed to load. Enter your address manually.");
        setGoogleMapsEnabled(false);
        setIsLoaded(true);
      }
    };

    initializeAutocomplete();
  }, [onChange, usePostalCodeOnly]); // ✅ closes useEffect correctly

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
        placeholder={!isLoaded ? "Loading address search..." : hasError ? "Enter your address manually" : placeholder}
        className={className}
        disabled={!isLoaded}
      />

      {googleMapsEnabled && (
        <p className="text-xs text-gray-400 mt-1">Powered by Google Maps</p>
      )}
      {hasError && errorMessage && (
        <p className="text-sm text-red-600">{errorMessage}</p>
      )}
    </div>
  );
};

export default AddressAutocomplete;
export { AddressAutocomplete };
export type { AddressData };
