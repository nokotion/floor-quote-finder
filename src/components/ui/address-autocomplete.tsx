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
  isProcessing?: boolean;
}

interface Props {
  value: string;
  onChange: (address: string, data?: AddressData) => void;
  placeholder?: string;
  id?: string;
  error?: string;
  onLoadingChange?: (loading: boolean) => void;
}

const AddressAutocomplete: React.FC<Props> = ({ value, onChange, placeholder, id, error, onLoadingChange }) => {
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
        types: ["address"], // More specific than "geocode"
        componentRestrictions: { country: "ca" },
        fields: ["formatted_address", "address_components", "geometry", "place_id"]
      });

      const placeChangedListener = autocomplete.addListener("place_changed", async () => {
        const place = autocomplete.getPlace();
        if (!place?.formatted_address) return;

        // Signal that we're processing Google Places data
        onLoadingChange?.(true);

        console.log("🗺️ Google Places API Response:", {
          formatted_address: place.formatted_address,
          address_components: place.address_components,
          geometry: place.geometry
        });

        const data: AddressData = { 
          formatted_address: place.formatted_address,
          fromGoogleSuggestion: true,
          isProcessing: true
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

        // If no postal code found, try Geocoding API fallback
        if (!data.postal_code && place.geometry?.location) {
          console.log("⚠️ No postal code in components, trying Geocoding API fallback");
          try {
            const geocoder = new google.maps.Geocoder();
            const result = await geocoder.geocode({ 
              location: place.geometry.location 
            });
            
            if (result.results[0]) {
              console.log("🌍 Geocoding API Response:", result.results[0]);
              result.results[0].address_components?.forEach((c) => {
                if (c.types.includes("postal_code") && !data.postal_code) {
                  data.postal_code = c.long_name;
                  console.log("✅ Found postal code via Geocoding API:", data.postal_code);
                }
              });
            }
          } catch (geocodeError) {
            console.error("❌ Geocoding API error:", geocodeError);
          }
        }

        // Final fallback: Extract postal code from formatted_address using regex
        if (!data.postal_code) {
          console.log("⚠️ Still no postal code, trying regex extraction from formatted address");
          const canadianPostalPattern = /([A-Z]\d[A-Z]\s?\d[A-Z]\d)/i;
          const match = place.formatted_address.match(canadianPostalPattern);
          if (match) {
            data.postal_code = match[1].replace(/\s/g, '').replace(/(.{3})(.{3})/, '$1 $2').toUpperCase();
            console.log("✅ Extracted postal code from formatted address:", data.postal_code);
          } else {
            console.log("❌ Could not extract postal code from formatted address:", place.formatted_address);
          }
        }

        // Mark processing as complete
        data.isProcessing = false;

        console.log("📤 Final address data being passed:", data);
        
        // Call onChange only after ALL async operations are complete
        onChange(place.formatted_address, data);
        
        // Signal that processing is complete
        onLoadingChange?.(false);
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
