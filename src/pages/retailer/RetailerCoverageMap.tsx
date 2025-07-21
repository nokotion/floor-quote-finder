
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin, Search, Info, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
  validatePostalPrefix,
  getPostalPrefixInfo,
  calculateTotalCoverage,
  formatPostalPrefix,
  POSTAL_CODE_PRESETS
} from '@/utils/enhancedPostalCodeUtils';

declare global {
  interface Window {
    google: any;
  }
}

const RetailerCoverageMap = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [postalPrefixes, setPostalPrefixes] = useState<string[]>([]);
  const [selectedPrefixes, setSelectedPrefixes] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [retailerId, setRetailerId] = useState<string>('');

  useEffect(() => {
    initializeMap();
    fetchRetailerData();
  }, []);

  const fetchRetailerData = async () => {
    try {
      const { data: profile } = await supabase.auth.getUser();
      if (!profile.user) return;

      const { data: userProfile } = await supabase
        .from('profiles')
        .select('retailer_id')
        .eq('id', profile.user.id)
        .single();

      if (!userProfile?.retailer_id) return;

      setRetailerId(userProfile.retailer_id);

      const { data: retailer } = await supabase
        .from('retailers')
        .select('postal_code_prefixes')
        .eq('id', userProfile.retailer_id)
        .single();

      if (retailer) {
        setPostalPrefixes(retailer.postal_code_prefixes || []);
        setSelectedPrefixes(retailer.postal_code_prefixes || []);
      }
    } catch (error) {
      console.error('Error fetching retailer data:', error);
    }
  };

  const initializeMap = async () => {
    try {
      const { data } = await supabase.functions.invoke('google-maps-config');
      
      if (!data?.apiKey) {
        toast({
          title: "Configuration Error",
          description: "Google Maps API key not configured",
          variant: "destructive",
        });
        return;
      }

      // Load Google Maps API
      if (!window.google) {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${data.apiKey}&libraries=geometry,places`;
        script.async = true;
        script.onload = () => initMap();
        document.head.appendChild(script);
      } else {
        initMap();
      }
    } catch (error) {
      console.error('Error loading Google Maps:', error);
      toast({
        title: "Map Error",
        description: "Failed to load Google Maps",
        variant: "destructive",
      });
    }
  };

  const initMap = () => {
    if (!mapRef.current || !window.google) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: 45.4215, lng: -75.6972 }, // Ottawa, Canada
      zoom: 6,
      styles: [
        {
          featureType: "administrative.country",
          elementType: "geometry.stroke",
          stylers: [{ color: "#4285F4" }]
        }
      ]
    });

    mapInstance.current = map;
    setIsMapLoaded(true);

    // Add click listener for postal code selection
    map.addListener('click', (event: any) => {
      handleMapClick(event.latLng);
    });

    // Load existing coverage areas
    loadCoverageAreas();
  };

  const handleMapClick = async (latLng: any) => {
    try {
      const geocoder = new window.google.maps.Geocoder();
      const response = await geocoder.geocode({ location: latLng });
      
      if (response.results && response.results.length > 0) {
        const addressComponents = response.results[0].address_components;
        const postalCodeComponent = addressComponents.find(
          (component: any) => component.types.includes('postal_code')
        );
        
        if (postalCodeComponent) {
          const postalCode = postalCodeComponent.long_name;
          const prefix = postalCode.substring(0, 3); // Get first 3 characters
          handlePrefixSelection(prefix);
        }
      }
    } catch (error) {
      console.error('Error geocoding location:', error);
    }
  };

  const handlePrefixSelection = (prefix: string) => {
    const formattedPrefix = formatPostalPrefix(prefix);
    const validation = validatePostalPrefix(formattedPrefix);
    
    if (!validation.isValid) {
      toast({
        title: "Invalid Postal Code",
        description: validation.error,
        variant: "destructive",
      });
      return;
    }

    if (selectedPrefixes.includes(formattedPrefix)) {
      setSelectedPrefixes(prev => prev.filter(p => p !== formattedPrefix));
    } else {
      setSelectedPrefixes(prev => [...prev, formattedPrefix]);
    }
  };

  const loadCoverageAreas = () => {
    if (!mapInstance.current) return;

    // Clear existing overlays
    // This is a simplified implementation - in a real app you'd use postal code boundary data
    postalPrefixes.forEach(prefix => {
      // Create visual representation of coverage areas
      // This would require postal code boundary data from a service like Statistics Canada
      console.log(`Loading coverage for ${prefix}`);
    });
  };

  const handleSearchPostalCode = () => {
    if (!searchQuery.trim()) return;

    const formattedQuery = formatPostalPrefix(searchQuery);
    const validation = validatePostalPrefix(formattedQuery);
    
    if (validation.isValid) {
      handlePrefixSelection(formattedQuery);
      setSearchQuery('');
    } else {
      toast({
        title: "Invalid Format",
        description: validation.error,
        variant: "destructive",
      });
    }
  };

  const handleSaveCoverage = async () => {
    if (!retailerId) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('retailers')
        .update({ postal_code_prefixes: selectedPrefixes })
        .eq('id', retailerId);

      if (error) throw error;

      setPostalPrefixes(selectedPrefixes);
      toast({
        title: "Coverage Saved",
        description: "Your coverage areas have been updated successfully.",
      });
    } catch (error) {
      console.error('Error saving coverage:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save coverage areas. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addPresetCoverage = (presetName: string) => {
    const presetPrefixes = POSTAL_CODE_PRESETS[presetName as keyof typeof POSTAL_CODE_PRESETS];
    if (!presetPrefixes) return;

    const newPrefixes = [...new Set([...selectedPrefixes, ...presetPrefixes])];
    setSelectedPrefixes(newPrefixes);
    
    toast({
      title: "Preset Added",
      description: `Added ${presetName} coverage areas.`,
    });
  };

  const coverage = calculateTotalCoverage(selectedPrefixes);
  const hasChanges = JSON.stringify(selectedPrefixes.sort()) !== JSON.stringify(postalPrefixes.sort());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Coverage Map</h1>
        <Button 
          onClick={handleSaveCoverage}
          disabled={isLoading || !hasChanges}
          className="flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          Save Coverage
        </Button>
      </div>

      {/* Coverage Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5" />
            Coverage Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{selectedPrefixes.length}</div>
              <div className="text-sm text-gray-600">Active Areas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{coverage.totalAreas}</div>
              <div className="text-sm text-gray-600">Est. Postal Areas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{coverage.coverageLevel}</div>
              <div className="text-sm text-gray-600">Coverage Level</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Interactive Coverage Map
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              ref={mapRef}
              className="w-full h-96 bg-gray-100 rounded-lg"
              style={{ minHeight: '400px' }}
            >
              {!isMapLoaded && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-gray-500">Loading map...</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Controls */}
        <div className="space-y-4">
          {/* Search */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Search Postal Code</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., L5J, M1C, K1A"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearchPostalCode()}
                  maxLength={3}
                />
                <Button 
                  onClick={handleSearchPostalCode}
                  size="sm"
                  variant="outline"
                >
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Add Presets */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Add Regions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {Object.keys(POSTAL_CODE_PRESETS).slice(0, 5).map((preset) => (
                <Button
                  key={preset}
                  variant="outline"
                  size="sm"
                  onClick={() => addPresetCoverage(preset)}
                  className="w-full justify-start"
                >
                  {preset}
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Selected Areas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Selected Areas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {selectedPrefixes.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">
                    No areas selected. Click on the map or search to add coverage areas.
                  </p>
                ) : (
                  selectedPrefixes.map((prefix) => {
                    const info = getPostalPrefixInfo(prefix);
                    return (
                      <div
                        key={prefix}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <div>
                          <Badge variant="outline" className="mr-2">
                            {prefix}*
                          </Badge>
                          <span className="text-xs text-gray-600">{info.type}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePrefixSelection(prefix)}
                        >
                          Remove
                        </Button>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Help */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>How to use:</strong> Click on the map to select postal code areas, or use the search box to add specific prefixes. 
          Selected areas will be highlighted and you can remove them by clicking the "Remove" button.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default RetailerCoverageMap;
