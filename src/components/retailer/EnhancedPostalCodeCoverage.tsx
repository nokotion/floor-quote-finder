import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { X, Plus, MapPin, AlertTriangle, Info } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
  validatePostalPrefix,
  getPostalPrefixInfo,
  checkForOverlappingPrefixes,
  formatPostalPrefix,
  getPostalPrefixDisplay,
  calculateTotalCoverage,
  POSTAL_CODE_PRESETS,
  type PostalCodePrefix
} from '@/utils/enhancedPostalCodeUtils';

interface EnhancedPostalCodeCoverageProps {
  retailerId: string;
}

const EnhancedPostalCodeCoverage = ({ retailerId }: EnhancedPostalCodeCoverageProps) => {
  const [postalPrefixes, setPostalPrefixes] = useState<string[]>([]);
  const [newPrefix, setNewPrefix] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [showValidation, setShowValidation] = useState(false);

  useEffect(() => {
    fetchPostalPrefixes();
  }, [retailerId]);

  const fetchPostalPrefixes = async () => {
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

      if (retailer) {
        setPostalPrefixes(retailer.postal_code_prefixes || []);
      }
    } catch (error) {
      console.error('Error fetching postal prefixes:', error);
    }
  };

  const addPostalPrefix = async () => {
    const formattedPrefix = formatPostalPrefix(newPrefix);
    
    if (!formattedPrefix) return;
    
    const validation = validatePostalPrefix(formattedPrefix);
    if (!validation.isValid) {
      toast({
        title: "Invalid Format",
        description: validation.error,
        variant: "destructive",
      });
      return;
    }

    if (postalPrefixes.includes(formattedPrefix)) {
      toast({
        title: "Already Added",
        description: "This postal code prefix is already in your coverage area.",
        variant: "destructive",
      });
      return;
    }

    const newPrefixes = [...postalPrefixes, formattedPrefix];
    const overlapCheck = checkForOverlappingPrefixes(newPrefixes);
    
    if (overlapCheck.hasOverlap) {
      toast({
        title: "Overlapping Coverage",
        description: `Warning: ${overlapCheck.conflicts[0]}. This may cause redundant coverage.`,
        variant: "destructive",
      });
    }

    await updatePostalPrefixes(newPrefixes);
    setNewPrefix('');
  };

  const addPresetPrefixes = async (presetName: string) => {
    const presetPrefixes = POSTAL_CODE_PRESETS[presetName as keyof typeof POSTAL_CODE_PRESETS];
    if (!presetPrefixes) return;

    const newPrefixes = [...new Set([...postalPrefixes, ...presetPrefixes])];
    await updatePostalPrefixes(newPrefixes);
    setSelectedPreset('');
    
    toast({
      title: "Preset Added",
      description: `Added ${presetName} coverage areas to your service region.`,
    });
  };

  const removePostalPrefix = async (prefixToRemove: string) => {
    const updatedPrefixes = postalPrefixes.filter(prefix => prefix !== prefixToRemove);
    await updatePostalPrefixes(updatedPrefixes);
  };

  const updatePostalPrefixes = async (newPrefixes: string[]) => {
    setIsLoading(true);
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
        .update({ postal_code_prefixes: newPrefixes })
        .eq('id', userProfile.retailer_id);

      if (error) throw error;

      setPostalPrefixes(newPrefixes);
      toast({
        title: "Coverage Updated",
        description: "Your postal code coverage has been saved.",
      });
    } catch (error) {
      console.error('Error updating postal prefixes:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update postal code coverage. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addPostalPrefix();
    }
  };

  const coverage = calculateTotalCoverage(postalPrefixes);
  const overlapCheck = checkForOverlappingPrefixes(postalPrefixes);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Enhanced Postal Code Coverage
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Set up flexible coverage areas using 1, 2, or 3 character postal prefixes
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Coverage Summary */}
        {postalPrefixes.length > 0 && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Coverage Summary:</strong> {coverage.coverageLevel} coverage with approximately {coverage.totalAreas} postal areas
            </AlertDescription>
          </Alert>
        )}

        {/* Overlap Warning */}
        {overlapCheck.hasOverlap && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Overlapping Coverage Detected:</strong> {overlapCheck.conflicts.join(', ')}
            </AlertDescription>
          </Alert>
        )}

        {/* Manual Entry */}
        <div className="space-y-3">
          <h4 className="font-medium">Add Individual Prefix</h4>
          <div className="flex gap-2">
            <Input
              placeholder="e.g., L (broad), L5 (medium), L5J (specific)"
              value={newPrefix}
              onChange={(e) => {
                setNewPrefix(e.target.value);
                setShowValidation(e.target.value.length > 0);
              }}
              onKeyPress={handleKeyPress}
              maxLength={3}
              className="flex-1"
            />
            <Button 
              onClick={addPostalPrefix}
              disabled={isLoading || !newPrefix.trim()}
              size="sm"
            >
              <Plus className="w-4 h-4" />
              Add
            </Button>
          </div>

          {/* Real-time validation feedback */}
          {showValidation && newPrefix.trim() && (
            <div className="text-sm">
              {(() => {
                const validation = validatePostalPrefix(newPrefix.trim());
                if (validation.isValid) {
                  const info = getPostalPrefixInfo(newPrefix.trim());
                  return (
                    <div className="text-green-600 bg-green-50 p-2 rounded border">
                      <strong>{info.type.charAt(0).toUpperCase() + info.type.slice(1)} Coverage:</strong> {info.coverageDescription}
                      <br />
                      <small>Estimated ~{info.estimatedAreas} postal areas</small>
                    </div>
                  );
                } else {
                  return (
                    <div className="text-red-600 bg-red-50 p-2 rounded border">
                      {validation.error}
                    </div>
                  );
                }
              })()}
            </div>
          )}
        </div>

        <Separator />

        {/* Preset Selection */}
        <div className="space-y-3">
          <h4 className="font-medium">Quick Add by Region</h4>
          <div className="flex gap-2">
            <Select value={selectedPreset} onValueChange={setSelectedPreset}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Choose a major city/region..." />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(POSTAL_CODE_PRESETS).map((preset) => (
                  <SelectItem key={preset} value={preset}>
                    {preset} ({POSTAL_CODE_PRESETS[preset as keyof typeof POSTAL_CODE_PRESETS].length} areas)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              onClick={() => selectedPreset && addPresetPrefixes(selectedPreset)}
              disabled={isLoading || !selectedPreset}
              variant="outline"
              size="sm"
            >
              Add Region
            </Button>
          </div>
        </div>

        <Separator />

        {/* Current Coverage Display */}
        <div className="space-y-3">
          <h4 className="font-medium">Current Coverage Areas</h4>
          <div className="flex flex-wrap gap-2 min-h-[60px] p-3 border rounded-lg bg-muted/30">
            {postalPrefixes.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">
                No postal code prefixes added yet. Add some to start receiving leads in those areas.
              </p>
            ) : (
              postalPrefixes.map((prefix) => {
                const info = getPostalPrefixInfo(prefix);
                return (
                  <Badge 
                    key={prefix} 
                    variant={info.type === 'broad' ? 'default' : info.type === 'medium' ? 'secondary' : 'outline'}
                    className="flex items-center gap-1 px-3 py-1"
                  >
                    <span className="font-mono">{getPostalPrefixDisplay(prefix)}</span>
                    <span className="text-xs opacity-75">({info.type})</span>
                    <button
                      onClick={() => removePostalPrefix(prefix)}
                      className="ml-1 hover:text-destructive transition-colors"
                      disabled={isLoading}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                );
              })
            )}
          </div>
        </div>

        {/* Help Text */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Coverage Types:</strong></p>
          <ul className="ml-4 space-y-1">
            <li>• <strong>Broad (1 char):</strong> L* = All L postal codes (entire region/province)</li>
            <li>• <strong>Medium (2 chars):</strong> L5* = All L5 postal codes (city/district level)</li>
            <li>• <strong>Specific (3 chars):</strong> L5J* = All L5J postal codes (neighborhood level)</li>
          </ul>
          <p className="mt-2">You'll receive leads from customers in areas matching these postal code prefixes.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedPostalCodeCoverage;