import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Map, MapPin, Info, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface MapBasedCoverageProps {
  retailerId: string;
  onCoverageChange?: (prefixes: string[]) => void;
}

interface PostalRegion {
  prefix: string;
  bounds: google.maps.LatLngBounds;
  polygon?: google.maps.Polygon;
  isSelected: boolean;
}

const MapBasedCoverage = ({ retailerId, onCoverageChange }: MapBasedCoverageProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedPrefixes, setSelectedPrefixes] = useState<string[]>([]);
  const [postalRegions, setPostalRegions] = useState<PostalRegion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiKey, setApiKey] = useState<string>('');
  const [saving, setSaving] = useState(false);

  // Canadian postal code regions with approximate coordinates
  const POSTAL_REGIONS = {
    // British Columbia
    'V': { lat: 49.2827, lng: -123.1207, name: 'British Columbia' },
    // Alberta
    'T': { lat: 53.5461, lng: -113.4938, name: 'Alberta' },
    // Saskatchewan & Manitoba
    'S': { lat: 52.1332, lng: -106.6700, name: 'Saskatchewan' },
    'R': { lat: 49.8951, lng: -97.1384, name: 'Manitoba' },
    // Ontario
    'K': { lat: 45.4215, lng: -75.6972, name: 'Eastern Ontario' },
    'L': { lat: 43.6532, lng: -79.3832, name: 'Toronto Area' },
    'M': { lat: 43.6532, lng: -79.3832, name: 'Toronto Core' },
    'N': { lat: 43.4643, lng: -80.5204, name: 'Western Ontario' },
    'P': { lat: 46.4917, lng: -84.3356, name: 'Northern Ontario' },
    // Quebec
    'G': { lat: 46.8139, lng: -71.2080, name: 'Eastern Quebec' },
    'H': { lat: 45.5017, lng: -73.5673, name: 'Montreal Area' },
    'J': { lat: 45.3811, lng: -71.9279, name: 'Western Quebec' },
    // Maritime Provinces
    'E': { lat: 46.2382, lng: -63.1311, name: 'New Brunswick' },
    'B': { lat: 44.6820, lng: -63.7443, name: 'Nova Scotia' },
    'C': { lat: 46.5107, lng: -63.4168, name: 'Prince Edward Island' },
    // Newfoundland & Labrador
    'A': { lat: 47.5615, lng: -52.7126, name: 'Newfoundland & Labrador' },
    // Territories
    'X': { lat: 60.7212, lng: -135.0568, name: 'Northwest Territories & Nunavut' },
    'Y': { lat: 60.7212, lng: -135.0568, name: 'Yukon' }
  };

  useEffect(() => {
    initializeMap();
    fetchCurrentCoverage();
  }, []);

  const fetchGoogleMapsApiKey = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('google-maps-config');
      if (error) throw error;
      setApiKey(data.apiKey);
      return data.apiKey;
    } catch (error) {
      console.error('Error fetching Google Maps API key:', error);
      toast({
        title: "Error",
        description: "Failed to load map. Please try again later.",
        variant: "destructive",
      });
      return null;
    }
  };

  const fetchCurrentCoverage = async () => {
    try {
      const { data: profile } = await supabase.auth.getUser();
      if (!profile.user) return;

      const { data: userProfile } = await supabase
        .from('profiles')
        .select('retailer_id')
        .eq('id', profile.user.id)
        .single();

      if (!userProfile?.retailer_id) return;

      const { data: retailer } = await supabase
        .from('retailers')
        .select('postal_code_prefixes')
        .eq('id', userProfile.retailer_id)
        .single();

      if (retailer?.postal_code_prefixes) {
        setSelectedPrefixes(retailer.postal_code_prefixes);
      }
    } catch (error) {
      console.error('Error fetching current coverage:', error);
    }
  };

  const initializeMap = async () => {
    if (!mapRef.current) return;

    const key = await fetchGoogleMapsApiKey();
    if (!key) return;

    try {
      // Load Google Maps script dynamically
      if (!window.google?.maps) {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=geometry`;
        script.async = true;
        script.defer = true;
        
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      // Initialize map centered on Canada
      const mapInstance = new google.maps.Map(mapRef.current, {
        center: { lat: 56.1304, lng: -106.3468 }, // Center of Canada
        zoom: 4,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: [
          {
            featureType: "administrative.country",
            elementType: "geometry.stroke",
            stylers: [{ color: "#4285f4" }, { weight: 2 }]
          }
        ]
      });

      setMap(mapInstance);
      createPostalRegions(mapInstance);
      setIsLoading(false);
    } catch (error) {
      console.error('Error initializing map:', error);
      setIsLoading(false);
      toast({
        title: "Error",
        description: "Failed to initialize map. Please refresh the page.",
        variant: "destructive",
      });
    }
  };

  const createPostalRegions = (mapInstance: google.maps.Map) => {
    const regions: PostalRegion[] = [];

    Object.entries(POSTAL_REGIONS).forEach(([prefix, info]) => {
      // Create approximate bounds for each postal region
      const bounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(info.lat - 2, info.lng - 3),
        new google.maps.LatLng(info.lat + 2, info.lng + 3)
      );

      // Create a rectangular polygon for the region
      const polygon = new google.maps.Polygon({
        paths: [
          { lat: info.lat - 2, lng: info.lng - 3 },
          { lat: info.lat - 2, lng: info.lng + 3 },
          { lat: info.lat + 2, lng: info.lng + 3 },
          { lat: info.lat + 2, lng: info.lng - 3 }
        ],
        strokeColor: selectedPrefixes.includes(prefix) ? '#4285f4' : '#9CA3AF',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: selectedPrefixes.includes(prefix) ? '#4285f4' : '#E5E7EB',
        fillOpacity: selectedPrefixes.includes(prefix) ? 0.35 : 0.15,
        map: mapInstance,
        clickable: true
      });

      // Add click listener
      polygon.addListener('click', () => {
        toggleRegion(prefix);
      });

      // Add info window
      const infoWindow = new google.maps.InfoWindow({
        content: `<div><strong>${prefix}*</strong><br/>${info.name}<br/><small>Click to ${selectedPrefixes.includes(prefix) ? 'remove' : 'add'}</small></div>`
      });

      polygon.addListener('mouseover', (event: any) => {
        infoWindow.setPosition(event.latLng);
        infoWindow.open(mapInstance);
      });

      polygon.addListener('mouseout', () => {
        infoWindow.close();
      });

      regions.push({
        prefix,
        bounds,
        polygon,
        isSelected: selectedPrefixes.includes(prefix)
      });
    });

    setPostalRegions(regions);
  };

  const toggleRegion = (prefix: string) => {
    setSelectedPrefixes(prev => {
      const newPrefixes = prev.includes(prefix)
        ? prev.filter(p => p !== prefix)
        : [...prev, prefix];
      
      // Update polygon styling
      const region = postalRegions.find(r => r.prefix === prefix);
      if (region?.polygon) {
        const isSelected = newPrefixes.includes(prefix);
        region.polygon.setOptions({
          strokeColor: isSelected ? '#4285f4' : '#9CA3AF',
          fillColor: isSelected ? '#4285f4' : '#E5E7EB',
          fillOpacity: isSelected ? 0.35 : 0.15
        });
        region.isSelected = isSelected;
      }

      onCoverageChange?.(newPrefixes);
      return newPrefixes;
    });
  };

  const saveCoverage = async () => {
    setSaving(true);
    try {
      const { data: profile } = await supabase.auth.getUser();
      if (!profile.user) return;

      const { data: userProfile } = await supabase
        .from('profiles')
        .select('retailer_id')
        .eq('id', profile.user.id)
        .single();

      if (!userProfile?.retailer_id) return;

      const { error } = await supabase
        .from('retailers')
        .update({ postal_code_prefixes: selectedPrefixes })
        .eq('id', userProfile.retailer_id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Coverage updated! You're now receiving leads from ${selectedPrefixes.length} postal regions.`,
      });
    } catch (error) {
      console.error('Error saving coverage:', error);
      toast({
        title: "Error",
        description: "Failed to save coverage. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const clearAllCoverage = () => {
    setSelectedPrefixes([]);
    postalRegions.forEach(region => {
      if (region.polygon) {
        region.polygon.setOptions({
          strokeColor: '#9CA3AF',
          fillColor: '#E5E7EB',
          fillOpacity: 0.15
        });
        region.isSelected = false;
      }
    });
    onCoverageChange?.([]);
  };

  const selectAllCoverage = () => {
    const allPrefixes = Object.keys(POSTAL_REGIONS);
    setSelectedPrefixes(allPrefixes);
    postalRegions.forEach(region => {
      if (region.polygon) {
        region.polygon.setOptions({
          strokeColor: '#4285f4',
          fillColor: '#4285f4',
          fillOpacity: 0.35
        });
        region.isSelected = true;
      }
    });
    onCoverageChange?.(allPrefixes);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Map className="w-5 h-5" />
          Interactive Coverage Map
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Click on postal regions to select your coverage areas
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Coverage Summary */}
        {selectedPrefixes.length > 0 && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Selected Coverage:</strong> {selectedPrefixes.length} postal regions covering{' '}
              {selectedPrefixes.map(p => POSTAL_REGIONS[p as keyof typeof POSTAL_REGIONS]?.name).join(', ')}
            </AlertDescription>
          </Alert>
        )}

        {/* Map Container */}
        <div className="relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading interactive map...
              </div>
            </div>
          )}
          <div
            ref={mapRef}
            className="w-full h-96 rounded-lg border"
            style={{ minHeight: '400px' }}
          />
        </div>

        {/* Selected Regions Display */}
        <div className="space-y-2">
          <h4 className="font-medium">Selected Regions ({selectedPrefixes.length})</h4>
          <div className="flex flex-wrap gap-2 min-h-[50px] p-3 border rounded-lg bg-muted/30">
            {selectedPrefixes.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">
                Click on map regions to select your coverage areas
              </p>
            ) : (
              selectedPrefixes.map(prefix => (
                <Badge 
                  key={prefix} 
                  variant="default"
                  className="flex items-center gap-1"
                >
                  <MapPin className="w-3 h-3" />
                  {prefix}* - {POSTAL_REGIONS[prefix as keyof typeof POSTAL_REGIONS]?.name}
                </Badge>
              ))
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 flex-wrap">
          <Button 
            onClick={saveCoverage} 
            disabled={saving || selectedPrefixes.length === 0}
            className="flex items-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
            Save Coverage
          </Button>
          <Button 
            variant="outline" 
            onClick={selectAllCoverage}
            disabled={selectedPrefixes.length === Object.keys(POSTAL_REGIONS).length}
          >
            Select All Canada
          </Button>
          <Button 
            variant="outline" 
            onClick={clearAllCoverage}
            disabled={selectedPrefixes.length === 0}
          >
            Clear All
          </Button>
        </div>

        {/* Help Text */}
        <div className="text-xs text-muted-foreground p-3 bg-blue-50 rounded-lg">
          <p className="font-medium mb-1">How to use:</p>
          <ul className="space-y-1 ml-4">
            <li>• Click on any colored region to add/remove it from your coverage</li>
            <li>• Blue regions are selected, gray regions are not covered</li>
            <li>• Each region represents a major postal code prefix (e.g., L* = Toronto area)</li>
            <li>• You'll receive leads from customers in your selected regions</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default MapBasedCoverage;