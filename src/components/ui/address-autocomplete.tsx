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
        console.log("Initializing Google Places Autocomplete...");
        const loader = new Loader({
    apiKey: "YOUR_GOOGLE_MAPS_API_KEY",  // <-- put your key here for testing
    version: "weekly",
    libraries: ["places"]
});

          version: "weekly",
          libraries: ["places"]
        });

        await loader.load();

        if (inputRef.current && !autocompleteRef.current) {
          autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
            types: usePostalCodeOnly ? ["postal_code"] : ["address"],
            componentRestrictions: { country: "ca" },
            fields: ["formatted_address", "address_components", "geometry"]
          });

          autocompleteRef.current.addListener("place_changed", () => {
            const place = autocompleteRef.current?.getPlace();
            if (place && place.formatted_address) {
              const addressData: AddressData = { formatted_address: place.formatted_address };

              place.address_components?.forEach((c) => {
                const types = c.types;
                if (types.includes("street_number")) addressData.street_number = c.long_name;
                else if (types.includes("route")) addressData.route = c.long_name;
                else if (types.includes("locality")) addressData.locality = c.long_name;
                else if (types.includes("administrative_area_level_1")) addressData.administrative_area_level_1 = c.short_name;
                else if (types.includes("postal_code")) addressData.postal_code = c.long_name;
                else if (types.includes("country")) addressData.country = c.long_name;
              });

              console.log("Address data extracted:", addressData);
              onChange(place.formatted_address, addressData);
            }
          });
        }

        setGoogleMapsEnabled(true);
      } catch (err) {
        console.error("Error loading Google Maps:", err);
        setHasError(true);
        setErrorMessage("Google Maps failed. Manual input only.");
        setGoogleMapsEnabled(false);
      } finally {
        setIsLoaded(true);
      }
    };

    initializeAutocomplete();
  }, [onChange, usePostalCodeOnly]);

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
        disabled={false}
      />
      {googleMapsEnabled && <p className="text-xs text-gray-400 mt-1">Powered by Google Maps</p>}
      {hasError && <p className="text-sm text-red-600">{errorMessage}</p>}
    </div>
  );
};

export default AddressAutocomplete;
export { AddressAutocomplete };
export type { AddressData };
