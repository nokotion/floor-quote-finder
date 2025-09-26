/// <reference types="@types/google.maps" />
import React, { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

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
  const [apiKey, setApiKey] = useState<string | null>(null);

  useEffect(() => {
    // Fetch API key securely from google-maps-config
    const fetchApiKey = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('google-maps-config');

        if (error) throw error;
        
        if (data?.apiKey) {
          setApiKey(data.apiKey);
        } else {
          console.error("❌ No API key returned from google-maps-config");
        }
      } catch (error) {
        console.error("❌ Failed to fetch Google Maps API key:", error);
      }
    };

    fetchApiKey();
  }, []);

  useEffect(() => {
    if (!apiKey) return;

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.onload = () => setGoogleLoaded(true);
    script.onerror = () => console.error("❌ Google Maps failed to load");
    document.head.appendChild(script);

    return () => {
      // Clean up script if component unmounts
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [apiKey]);

  useEffect(() => {
    if (!googleLoaded || !inputRef.current) return;
    const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
      types: ["address"],
      componentRestrictions: { country: "ca" },
    });

    autocomplete.addListener("place_changed", () => {
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
  }, [googleLoaded]);

  return (
    <div className="space-y-1">
      <Input
        ref={inputRef}
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "Enter your address"}
      />
      {!googleLoaded && <p className="text-xs text-gray-400">Google Maps not loaded – manual entry only</p>}
    </div>
  );
};

export default AddressAutocomplete;
