/// <reference types="@types/google.maps" />
import React, { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Loader } from "@googlemaps/js-api-loader";

export interface AddressData {
  formatted_address: string;
  postal_code?: string;
  route?: string;
  locality?: string;
  administrative_area_level_1?: string;
  country?: string;
  fromGoogleSuggestion?: boolean;
}

interface Props {
  value: string;
  onChange: (address: string, data?: AddressData) => void;
  placeholder?: string;
  id?: string;
  error?: string;
}

const AddressAutocomplete: React.FC<Props> = ({ value, onChange, placeholder, id, error }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeGoogleMaps = async () => {
      try {
        // Fetch API key securely from google-maps-config
        const { data, error } = await supabase.functions.invoke('google-maps-config');

        if (error) throw error;
        
        if (!data?.apiKey) {
          console.error("❌ No API key returned from google-maps-config");
          setLoading(false);
          return;
        }

        // Use the modern Loader for better performance and error handling
        const loader = new Loader({
          apiKey: data.apiKey,
          version: "weekly",
          libraries: ["places"],
          region: "CA",
          language: "en"
        });

        await loader.load();
        setGoogleLoaded(true);
        setLoading(false);

      } catch (error) {
        console.error("❌ Failed to load Google Maps:", error);
        setLoading(false);
      }
    };

    initializeGoogleMaps();
  }, []);

  useEffect(() => {
    if (!googleLoaded || !inputRef.current) return;

    // Use the modern approach with better error handling
    try {
      const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
        types: ["address"],
        componentRestrictions: { country: "ca" },
        fields: ["formatted_address", "address_components"]
      });

      const placeChangedListener = autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (!place?.formatted_address) return;

        console.log("🗺️ Google Places API Response:", {
          formatted_address: place.formatted_address,
          address_components: place.address_components
        });

        const data: AddressData = { 
          formatted_address: place.formatted_address,
          fromGoogleSuggestion: true 
        };

        // Extract data from address components
        place.address_components?.forEach((c) => {
          const t = c.types;
          console.log("📍 Address component:", { types: t, long_name: c.long_name, short_name: c.short_name });
          if (t.includes("postal_code")) data.postal_code = c.long_name;
          if (t.includes("route")) data.route = c.long_name;
          if (t.includes("locality")) data.locality = c.long_name;
          if (t.includes("administrative_area_level_1")) data.administrative_area_level_1 = c.short_name;
          if (t.includes("country")) data.country = c.long_name;
        });

        // Fallback: Extract postal code from formatted_address if not found in components
        if (!data.postal_code) {
          console.log("⚠️ No postal code in components, trying fallback extraction from formatted address");
          const canadianPostalPattern = /([A-Z]\d[A-Z]\s?\d[A-Z]\d)/i;
          const match = place.formatted_address.match(canadianPostalPattern);
          if (match) {
            data.postal_code = match[1].replace(/\s/g, '').replace(/(.{3})(.{3})/, '$1 $2').toUpperCase();
            console.log("✅ Extracted postal code from formatted address:", data.postal_code);
          } else {
            console.log("❌ Could not extract postal code from formatted address:", place.formatted_address);
          }
        }

        console.log("📤 Final address data being passed:", data);
        onChange(place.formatted_address, data);
      });

      // Cleanup listener on unmount
      return () => {
        if (placeChangedListener) {
          google.maps.event.removeListener(placeChangedListener);
        }
      };
    } catch (error) {
      console.error("❌ Failed to initialize Google Places Autocomplete:", error);
    }
  }, [googleLoaded, onChange]);

  return (
    <div className="space-y-1">
      <Input
        ref={inputRef}
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "Enter your address"}
        disabled={loading}
        className={error ? "border-red-500" : ""}
      />
      {loading && <p className="text-xs text-muted-foreground">Loading address suggestions...</p>}
      {!googleLoaded && !loading && <p className="text-xs text-muted-foreground">Address suggestions unavailable – manual entry only</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default AddressAutocomplete;
