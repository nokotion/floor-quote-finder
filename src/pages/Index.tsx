/// <reference types="@types/google.maps" />
import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Input } from '@/components/ui/input';

export interface AddressData {
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
  usePostalCodeOnly = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [googleMapsEnabled, setGoogleMapsEnabled] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const init = async () => {
      try {
        console.log("🚀 Initializing Google Maps directly with API key");

        const loader = new Loader({
          apiKey: "AIzaSyAHCJ9TJj7wLc5Gk_7zmYq9gthe71o3x50", // ✅ Direct Key
          version: "weekly",
          libraries: ["places"],
        });

        await loader.load();
        console.log("✅ Google Maps API Loaded");

        if (inputRef.current && !autocompleteRef.current) {
          autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
            types: usePostalCodeOnly ? ["postal_code"] : ["address"],
            componentRestrictions: { country: "ca" },
            fields: ["formatted_address", "address_components", "geometry"],
          });

          autocompleteRef.current.addListener("place_changed", () => {
            const place = autocompleteRef.current?.getPlace();
            if (!place || !place.formatted_address) return;

            const addressData: AddressData = { formatted_address: place.formatted_address };
            place.address_components?.forEach((c) => {
              if (c.types.includes("street_number")) addressData.street_number = c.long_name;
              if (c.types.includes("route")) addressData.route = c.long_name;
              if (c.types.includes("locality")) addressData.locality = c.long_name;
              if (c.types.includes("administrative_area_level_1")) addressData.administrative_area_level_1 = c.short_name;
              if (c.types.includes("postal_code")) addressData.postal_code = c.long_name;
              if (c.types.includes("country")) addressData.country = c.long_name;
            });

            console.log("📍 Address Data Extracted:", addressData);
            onChange(place.formatted_address, addressData);
          });

          setGoogleMapsEnabled(true);
        }
      } catch (err) {
        console.error("❌ Google Maps failed to load:", err);
        setHasError(true);
        setErrorMessage("Google Maps failed to load. Enter your address manually.");
        setGoogleMapsEnabled(false);
      } finally {
        setIsLoaded(true); // ✅ Always enable input
      }
    };

    init();
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
        placeholder={!isLoaded ? "Loading address search..." : placeholder}
        className={className}
        disabled={false} // ✅ Always allow manual typing
      />
      {googleMapsEnabled && <p className="text-xs text-gray-400">Powered by Google Maps</p>}
      {hasError && <p className="text-sm text-red-600">{errorMessage}</p>}
    </div>
  );
};

export default AddressAutocomplete;
export { AddressAutocomplete };
export type { AddressData };
