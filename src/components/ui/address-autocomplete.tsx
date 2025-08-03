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

const FALLBACK_GOOGLE_KEY = "YOUR_FALLBACK_KEY_HERE"; // <-- TEMP fallback

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

  useEffect(() => {
    const loadMaps = async () => {
      try {
        let apiKey = FALLBACK_GOOGLE_KEY;

        // Try secure key from Supabase function
        const { data } = await supabase.functions.invoke('google-maps-config').catch(() => ({ data: null }));
        if (data?.apiKey) apiKey = data.apiKey;

        const loader = new Loader({
          apiKey,
          version: 'weekly',
          libraries: ['places']
        });
        await loader.load();

        if (inputRef.current) {
          autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
            types: usePostalCodeOnly ? ['postal_code'] : ['address'],
            componentRestrictions: { country: 'ca' },
            fields: ['formatted_address', 'address_components', 'geometry']
          });

          autocompleteRef.current.addListener('place_changed', () => {
            const place = autocompleteRef.current?.getPlace();
            if (!place?.formatted_address) return;

            const addressData: AddressData = { form
