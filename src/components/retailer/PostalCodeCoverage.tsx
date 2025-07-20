
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface PostalCodeCoverageProps {
  retailerId: string;
}

const PostalCodeCoverage = ({ retailerId }: PostalCodeCoverageProps) => {
  const [postalPrefixes, setPostalPrefixes] = useState<string[]>([]);
  const [newPrefix, setNewPrefix] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

  const validatePostalPrefix = (prefix: string): boolean => {
    // Canadian postal code prefix format: Letter + Digit + Letter (e.g., L5J, M1C)
    const regex = /^[A-Z]\d[A-Z]$/;
    return regex.test(prefix.toUpperCase());
  };

  const addPostalPrefix = async () => {
    const trimmedPrefix = newPrefix.trim().toUpperCase();
    
    if (!trimmedPrefix) return;
    
    if (!validatePostalPrefix(trimmedPrefix)) {
      toast({
        title: "Invalid Format",
        description: "Postal code prefix must be in format: L5J, M1C, etc.",
        variant: "destructive",
      });
      return;
    }

    if (postalPrefixes.includes(trimmedPrefix)) {
      toast({
        title: "Already Added",
        description: "This postal code prefix is already in your coverage area.",
        variant: "destructive",
      });
      return;
    }

    await updatePostalPrefixes([...postalPrefixes, trimmedPrefix]);
    setNewPrefix('');
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
        description: "Failed to update postal code coverage.",
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Postal Code Coverage</CardTitle>
        <p className="text-sm text-gray-500">
          Add postal code prefixes for your service areas (e.g., L5J, M1C, K1A)
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Enter postal prefix (e.g., L5J)"
            value={newPrefix}
            onChange={(e) => setNewPrefix(e.target.value)}
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

        <div className="flex flex-wrap gap-2 min-h-[40px]">
          {postalPrefixes.length === 0 ? (
            <p className="text-sm text-gray-400 italic">
              No postal code prefixes added yet. Add some to start receiving leads in those areas.
            </p>
          ) : (
            postalPrefixes.map((prefix) => (
              <Badge key={prefix} variant="secondary" className="flex items-center gap-1">
                {prefix}
                <button
                  onClick={() => removePostalPrefix(prefix)}
                  className="ml-1 hover:text-red-500"
                  disabled={isLoading}
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))
          )}
        </div>

        <p className="text-xs text-gray-400">
          You'll receive leads from customers in areas matching these postal code prefixes.
        </p>
      </CardContent>
    </Card>
  );
};

export default PostalCodeCoverage;
