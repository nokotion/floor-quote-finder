/// <reference types="@types/google.maps" />
import React, { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

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
  onChange: (address: string, data?: AddressData) => void;
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
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [googleMapsEnabled, setGoogleMapsEnabled] = useState(false);

  useEffect(() => {
    const initializeAutocomplete = async () => {
      try {
        console.log("Initializing Google Places Autocomplete...");
        const loader = new Loader({
          apiKey: "AlzaSyAHCJ9TJj7wLc5Gk_7zmYq9gthe71o3x50",
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
            if (!place || !place.formatted_address) return;

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

        setIsLoaded(true);
        setHasError(false);
        setErrorMessage("");
      } catch (err) {
        console.error("Google Maps failed:", err);
        setHasError(true);
        setErrorMessage("Google Maps failed to load. Enter your address manually.");
        setGoogleMapsEnabled(false);
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
        disabled={!isLoaded}
      />
      {googleMapsEnabled && <p cla
