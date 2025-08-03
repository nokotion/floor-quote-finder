
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

// Google Maps API key is now fetched securely from backend

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
        
        // Fetch Google Maps API key securely from edge function
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

          autocompleteRef.current.addListener('place_changed', () => {
            const place = autocompleteRef.current?.getPlace();
console.log('Place selected:', place);

if (place && place.formatted_address) {
  const addressData: AddressData = {
    formatted_address: place.formatted_address
  };

  if (place.address_components) {
    place.address_components.forEach((component) => {
      const types = component.types;
      if (types.includes('street_number')) addressData.street_number = component.long_name;
      else if (types.includes('route')) addressData.route = component.long_name;
      else if (types.includes('locality')) addressData.locality = component.long_name;
      else if (types.includes('administrative_area_level_1')) addressData.administrative_area_level_1 = component.short_name;
      else if (types.includes('postal_code')) addressData.postal_code = component.long_name;
      else if (types.includes('country')) addressData.country = component.long_name;
    });
  }

  console.log('Address data extracted:', addressData);
  onChange(place.formatted_address, addressData);
}
});
