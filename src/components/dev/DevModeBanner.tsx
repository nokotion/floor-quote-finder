import React from 'react';
import { useDevMode } from '@/contexts/DevModeContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Settings } from 'lucide-react';

export const DevModeBanner = () => {
  const { isDevMode, currentRole } = useDevMode();

  if (!isDevMode) return null;

  return (
    <Alert className="border-accent bg-accent/10 rounded-none border-x-0 border-t-0 border-b-2">
      <Settings className="h-4 w-4 text-accent" />
      <AlertDescription className="flex items-center gap-2">
        <span className="text-sm font-medium text-accent">Development Mode Active</span>
        <Badge variant="secondary" className="bg-accent/20 text-accent text-xs">
          {currentRole.toUpperCase()}
        </Badge>
        <span className="text-xs text-muted-foreground">
          Authentication bypassed - Full access enabled
        </span>
      </AlertDescription>
    </Alert>
  );
};