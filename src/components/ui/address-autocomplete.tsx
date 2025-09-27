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
}

interface Props {
  value: string;
  onChange: (address: string, data?: AddressData) => void;
  placeholder?: string;
  id?: string;
}

const AddressAutocomplete: React.FC<Props> = ({ value, onChange, placeholder, id }) => {
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

        const data: AddressData = { formatted_address: place.formatted_address };
        place.address_components?.forEach((c) => {
          const t = c.types;
          if (t.includes("postal_code")) data.postal_code = c.long_name;
          if (t.includes("route")) data.route = c.long_name;
          if (t.includes("locality")) data.locality = c.long_name;
          if (t.includes("administrative_area_level_1")) data.administrative_area_level_1 = c.short_name;
          if (t.includes("country")) data.country = c.long_name;
        });

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
      />
      {loading && <p className="text-xs text-muted-foreground">Loading address suggestions...</p>}
      {!googleLoaded && !loading && <p className="text-xs text-muted-foreground">Address suggestions unavailable – manual entry only</p>}
    </div>
  );
};

export default AddressAutocomplete;
