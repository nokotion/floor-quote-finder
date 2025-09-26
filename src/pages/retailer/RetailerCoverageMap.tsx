
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin, Plus, X, Info, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useDevMode } from '@/contexts/DevModeContext';
import {
  validatePostalPrefix,
  getPostalPrefixInfo,
  calculateTotalCoverage,
  formatPostalPrefix,
  POSTAL_CODE_PRESETS
} from '@/utils/enhancedPostalCodeUtils';

const MAX_COVERAGE_AREAS = 3;

// Generate proper UUID for dev mode
const generateDevUuid = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Dev mode storage key
const DEV_COVERAGE_KEY = 'dev-retailer-coverage';

const RetailerCoverageMap = () => {
  const { isDevMode } = useDevMode();
  const [postalPrefixes, setPostalPrefixes] = useState<string[]>([]);
  const [selectedPrefixes, setSelectedPrefixes] = useState<string[]>([]);
  const [newPrefix, setNewPrefix] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [retailerId, setRetailerId] = useState<string>('');

  useEffect(() => {
    if (isDevMode) {
      // Load from localStorage in dev mode
      const devRetailerId = generateDevUuid();
      setRetailerId(devRetailerId);
      
      const savedCoverage = localStorage.getItem(DEV_COVERAGE_KEY);
      if (savedCoverage) {
        try {
          const coverage = JSON.parse(savedCoverage);
          setPostalPrefixes(coverage);
          setSelectedPrefixes(coverage);
        } catch (error) {
          console.error('Error loading dev coverage:', error);
          // Set default dev coverage areas
          const defaultCoverage = ['M5V', 'L5J', 'K1A'];
          setPostalPrefixes(defaultCoverage);
          setSelectedPrefixes(defaultCoverage);
        }
      } else {
        // Set default dev coverage areas
        const defaultCoverage = ['M5V', 'L5J', 'K1A'];
        setPostalPrefixes(defaultCoverage);
        setSelectedPrefixes(defaultCoverage);
        localStorage.setItem(DEV_COVERAGE_KEY, JSON.stringify(defaultCoverage));
      }
    } else {
      fetchRetailerData();
    }
  }, [isDevMode]);

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
        const currentPrefixes = retailer.postal_code_prefixes || [];
        setPostalPrefixes(currentPrefixes);
        setSelectedPrefixes(currentPrefixes);
      }
    } catch (error) {
      console.error('Error fetching retailer data:', error);
    }
  };

  const addPostalPrefix = () => {
    const trimmedPrefix = newPrefix.trim().toUpperCase();
    
    if (!trimmedPrefix) return;
    
    // Check 3-area limit
    if (selectedPrefixes.length >= MAX_COVERAGE_AREAS) {
      toast({
        title: "Coverage Limit Reached",
        description: `You can only select up to ${MAX_COVERAGE_AREAS} coverage areas. Remove an existing area to add a new one.`,
        variant: "destructive",
      });
      return;
    }
    
    const validation = validatePostalPrefix(trimmedPrefix);
    if (!validation.isValid) {
      toast({
        title: "Invalid Format",
        description: validation.error,
        variant: "destructive",
      });
      return;
    }

    if (selectedPrefixes.includes(trimmedPrefix)) {
      toast({
        title: "Already Added",
        description: "This postal code area is already in your coverage.",
        variant: "destructive",
      });
      return;
    }

    setSelectedPrefixes(prev => [...prev, trimmedPrefix]);
    setNewPrefix('');
    
    toast({
      title: "Area Added",
      description: `Added ${trimmedPrefix} to your coverage areas.`,
    });
  };

  const removePostalPrefix = (prefixToRemove: string) => {
    setSelectedPrefixes(prev => prev.filter(p => p !== prefixToRemove));
    toast({
      title: "Area Removed",
      description: `Removed ${prefixToRemove} from your coverage areas.`,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addPostalPrefix();
    }
  };

  const handleSaveCoverage = async () => {
    if (!retailerId) return;

    setIsLoading(true);
    try {
      if (isDevMode) {
        // Save to localStorage in dev mode
        localStorage.setItem(DEV_COVERAGE_KEY, JSON.stringify(selectedPrefixes));
        setPostalPrefixes(selectedPrefixes);
        toast({
          title: "Coverage Saved (Dev Mode)",
          description: "Your coverage areas have been saved locally for testing.",
        });
      } else {
        // Save to database in production
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
      }
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

    const availableSlots = MAX_COVERAGE_AREAS - selectedPrefixes.length;
    if (availableSlots === 0) {
      toast({
        title: "Coverage Limit Reached",
        description: `You already have ${MAX_COVERAGE_AREAS} areas selected. Remove some areas first.`,
        variant: "destructive",
      });
      return;
    }

    const newPrefixes = presetPrefixes.slice(0, availableSlots);
    const uniquePrefixes = newPrefixes.filter(prefix => !selectedPrefixes.includes(prefix));
    
    if (uniquePrefixes.length === 0) {
      toast({
        title: "Already Added",
        description: "These coverage areas are already selected.",
        variant: "destructive",
      });
      return;
    }

    setSelectedPrefixes(prev => [...prev, ...uniquePrefixes]);
    
    toast({
      title: "Areas Added",
      description: `Added ${uniquePrefixes.length} coverage area(s) from ${presetName}.`,
    });
  };

  const coverage = calculateTotalCoverage(selectedPrefixes);
  const hasChanges = JSON.stringify(selectedPrefixes.sort()) !== JSON.stringify(postalPrefixes.sort());
  const remainingSlots = MAX_COVERAGE_AREAS - selectedPrefixes.length;

  return (
    <div className="space-y-6">
      {isDevMode && (
        <Alert className="border-accent bg-accent/10 border-l-4 border-l-accent">
          <Info className="h-4 w-4 text-accent" />
          <AlertDescription className="text-accent">
            <strong>Dev Mode:</strong> Coverage areas are saved locally for testing. Lead matching will work with your selected areas.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Coverage Areas</h1>
          <p className="text-muted-foreground">Manage your service coverage areas (FSA - Forward Sortation Areas)</p>
        </div>
        <Button 
          onClick={handleSaveCoverage}
          disabled={isLoading || !hasChanges}
          className="flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          Save Coverage
        </Button>
      </div>

      {/* Coverage Limit Status */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{selectedPrefixes.length} / {MAX_COVERAGE_AREAS}</div>
              <div className="text-sm text-muted-foreground">Coverage Areas Used</div>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: MAX_COVERAGE_AREAS }).map((_, index) => (
                <div
                  key={index}
                  className={`w-4 h-4 rounded-full ${
                    index < selectedPrefixes.length 
                      ? 'bg-primary' 
                      : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>
          {remainingSlots > 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              You can add {remainingSlots} more coverage area{remainingSlots !== 1 ? 's' : ''}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Canadian Postal Code Education */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5" />
            Canadian Postal Code System
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm space-y-2">
            <p><strong>Forward Sortation Area (FSA)</strong> - The first 3 characters of a postal code:</p>
            <ul className="list-disc list-inside space-y-1 ml-4 text-muted-foreground">
              <li><strong>1st character:</strong> Province/Territory (L=Central Ontario, M=Toronto, K=Eastern Ontario, etc.)</li>
              <li><strong>2nd character:</strong> Urban (1-9) or Rural (0) area</li> 
              <li><strong>3rd character:</strong> Specific geographic area within the region</li>
            </ul>
            <p className="text-muted-foreground">
              <strong>Examples:</strong> L5J covers Mississauga area, M1C covers Toronto Scarborough, K1A covers Ottawa downtown
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add Coverage Area */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add Coverage Area
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter FSA code (e.g., L5J, M1C, K1A)"
                  value={newPrefix}
                  onChange={(e) => setNewPrefix(e.target.value)}
                  onKeyPress={handleKeyPress}
                  maxLength={3}
                  className="flex-1"
                  disabled={remainingSlots === 0}
                />
                <Button 
                  onClick={addPostalPrefix}
                  disabled={isLoading || !newPrefix.trim() || remainingSlots === 0}
                  size="sm"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              {remainingSlots === 0 && (
                <p className="text-sm text-destructive">
                  Coverage limit reached. Remove an area to add a new one.
                </p>
              )}
            </div>

            {/* Quick Add Presets */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Quick Add Major Cities:</h4>
              <div className="grid grid-cols-1 gap-1">
                {Object.entries(POSTAL_CODE_PRESETS)
                  .slice(0, 6)
                  .map(([presetName, prefixes]) => (
                  <Button
                    key={presetName}
                    variant="outline"
                    size="sm"
                    onClick={() => addPresetCoverage(presetName)}
                    disabled={remainingSlots === 0}
                    className="justify-start text-xs h-8"
                  >
                    {presetName} ({prefixes.slice(0, 3).join(', ')}{prefixes.length > 3 ? '...' : ''})
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Selected Areas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Your Coverage Areas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {selectedPrefixes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No coverage areas selected</p>
                  <p className="text-xs">Add up to {MAX_COVERAGE_AREAS} FSA codes to start receiving leads</p>
                </div>
              ) : (
                selectedPrefixes.map((prefix) => {
                  const info = getPostalPrefixInfo(prefix);
                  return (
                    <div
                      key={prefix}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="default" className="font-mono">
                            {prefix}
                          </Badge>
                          <span className="text-sm text-muted-foreground capitalize">
                            {info.type} coverage
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {info.coverageDescription}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removePostalPrefix(prefix)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Coverage Summary */}
      {selectedPrefixes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Coverage Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{selectedPrefixes.length}</div>
                <div className="text-sm text-muted-foreground">FSA Areas</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">{coverage.totalAreas}</div>
                <div className="text-sm text-muted-foreground">Est. Neighborhoods</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">{coverage.coverageLevel}</div>
                <div className="text-sm text-muted-foreground">Coverage Level</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Tips:</strong> FSA codes cover broad geographic areas. For example, "L5J" covers Mississauga areas, 
          "M1C" covers Toronto Scarborough, and "K1A" covers Ottawa downtown. Choose strategically to maximize your lead coverage.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default RetailerCoverageMap;
