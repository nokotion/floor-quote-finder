
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Circle } from 'lucide-react';

interface MapLegendProps {
  selectedPrefixes: string[];
  activePrefixes: string[];
}

const MapLegend = ({ selectedPrefixes, activePrefixes }: MapLegendProps) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <MapPin className="w-4 h-4" />
          Map Legend
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2">
          <Circle className="w-3 h-3 fill-blue-500 text-blue-500" />
          <span className="text-xs">Selected Areas</span>
        </div>
        <div className="flex items-center gap-2">
          <Circle className="w-3 h-3 fill-green-500 text-green-500" />
          <span className="text-xs">Active Coverage</span>
        </div>
        <div className="flex items-center gap-2">
          <Circle className="w-3 h-3 fill-gray-300 text-gray-300" />
          <span className="text-xs">Available Areas</span>
        </div>
        
        <div className="pt-2 border-t">
          <div className="text-xs font-medium mb-1">Coverage Types:</div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">L*</Badge>
              <span className="text-xs">Broad (Province)</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">L5*</Badge>
              <span className="text-xs">Medium (City)</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="default" className="text-xs">L5J*</Badge>
              <span className="text-xs">Specific (Area)</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MapLegend;
