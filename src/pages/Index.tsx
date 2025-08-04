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

  useEffect(() => {
    const init = async () => {
      try {
        const loader = new Loader({
          apiKey: "AIzaSyAHCJ9TJj7wLc5Gk_7zmYq9gthe71o3x50", // ✅ Static key
          version: "weekly",
          libraries: ["places"],
        });

        await loader.load();

        if (inputRef.current) {
          autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
            types: usePostalCodeOnly ? ["postal_code"] : ["address"],
            componentRestrictions: { country: "ca" },
            fields: ["formatted_address", "address_components", "geometry"],
          });

          autocompleteRef.current.addListener("place_changed", () => {
            const place = autocompleteRef.current?.getPlace();
            if (!place?.formatted_address) return;

            const data: AddressData = { formatted_address: place.formatted_address };
            place.address_components?.forEach((c) => {
              if (c.types.includes("street_number")) data.street_number = c.long_name;
              if (c.types.includes("route")) data.route = c.long_name;
              if (c.types.includes("locality")) data.locality = c.long_name;
              if (c.types.includes("administrative_area_level_1")) data.administrative_area_level_1 = c.short_name;
              if (c.types.includes("postal_code")) data.postal_code = c.long_name;
              if (c.types.includes("country")) data.country = c.long_name;
            });

            onChange(place.formatted_address, data);
          });

          setGoogleMapsEnabled(true);
        }
      } catch (err) {
        console.error("❌ Google Maps failed, fallback to manual:", err);
      } finally {
        setIsLoaded(true);
      }
    };

    init();
  }, [onChange, usePostalCodeOnly]);

  const handleManual = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="space-y-1">
      <Input
        ref={inputRef}
        id={id}
        value={value}
        onChange={handleManual}
        onBlur={onBlur}
        placeholder={!isLoaded ? "Loading address search..." : placeholder}
        className={className}
        disabled={false} // ✅ Always enable
      />
      {googleMapsEnabled && <p className="text-xs text-gray-400">Powered by Google Maps</p>}
    </div>
  );
};

export default AddressAutocomplete;
export { AddressAutocomplete };
export type { AddressData };
