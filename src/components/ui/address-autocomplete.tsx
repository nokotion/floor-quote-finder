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
          console.log('Google Maps API key not configured - using fallback input mode');
          setHasError(true);
          setErrorMessage('Enter your complete address or postal code');
          setIsLoaded(true);
          return;
        }

        console.log('Loading Google Maps API...');
        const loader = new Loader({
          apiKey: data.apiKey,
          version: 'weekly',
          libraries: ['places']
        });
        await loader.load();
        console.log('Google Maps API loaded successfully');

        if (inputRef.current && !autocompleteRef.current) {
          console.log('Creating Google Places Autocomplete instance...');
         autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
  types: usePostalCodeOnly ? ['postal_code'] : ['address'],
  componentRestrictions: { country: 'ca' },
  fields: ['formatted_address', 'address_components', 'geometry']
});

