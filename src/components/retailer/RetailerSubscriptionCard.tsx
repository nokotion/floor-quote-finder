
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { SQFT_TIERS } from "@/constants/flooringData";
import { CheckSquare, Square, Info } from "lucide-react";

interface BrandSubscription {
  id: string;
  brand_name: string;
  sqft_tier: string;
  accepts_installation: boolean;
  is_active: boolean;
}

interface FlooringBrand {
  id: string;
  name: string;
  categories: string;
  logo_url?: string;
  featured: boolean;
}

interface RetailerSubscriptionCardProps {
  brand: FlooringBrand;
  subscriptions: BrandSubscription[];
  onToggleTier: (brandName: string, tier: string, checked: boolean) => void;
  onToggleInstall: (brandName: string, tier: string, checked: boolean) => void;
  savingStates?: {[key: string]: boolean};
}

export default function RetailerSubscriptionCard({ 
  brand, 
  subscriptions, 
  onToggleTier, 
  onToggleInstall,
  savingStates = {}
}: RetailerSubscriptionCardProps) {
  const activeSubscriptions = subscriptions.filter(s => s.is_active);
  const categoriesArray = brand.categories ? brand.categories.split(',').map(c => c.trim()) : [];
  
  const handleSelectAll = () => {
    SQFT_TIERS.forEach(tier => {
      const subscription = subscriptions.find(s => s.sqft_tier === tier.value);
      if (!subscription?.is_active) {
        onToggleTier(brand.name, tier.value, true);
      }
    });
  };

  const handleDeselectAll = () => {
    SQFT_TIERS.forEach(tier => {
      const subscription = subscriptions.find(s => s.sqft_tier === tier.value);
      if (subscription?.is_active) {
        onToggleTier(brand.name, tier.value, false);
      }
    });
  };

  const totalCost = activeSubscriptions.reduce((sum, sub) => {
    const tier = SQFT_TIERS.find(t => t.value === sub.sqft_tier);
    const baseCost = tier?.basePrice || 0;
    const installCost = sub.accepts_installation ? 0.50 : 0;
    return sum + baseCost + installCost;
  }, 0);

  return (
    <TooltipProvider>
      <Card className="w-full max-w-xs border rounded-xl shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          {/* Brand Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {brand.logo_url && (
                <img 
                  src={brand.logo_url} 
                  alt={brand.name} 
                  className="w-6 h-6 rounded-sm object-contain flex-shrink-0" 
                />
              )}
              <span className="font-semibold text-sm truncate max-w-[130px]">{brand.name}</span>
            </div>
            <div className="flex items-center gap-1">
              {brand.featured && (
                <Badge variant="secondary" className="text-xs px-2 py-0.5">Featured</Badge>
              )}
              {activeSubscriptions.length > 0 && (
                <Badge variant="default" className="text-xs px-2 py-0.5">
                  {activeSubscriptions.length} Active
                </Badge>
              )}
            </div>
          </div>

          {/* Categories */}
          <div className="text-xs text-muted-foreground mb-3">
            {categoriesArray.join(", ")}
          </div>

          {/* Multi-selection guidance */}
          <div className="flex items-center gap-1 mb-3 p-2 bg-blue-50 rounded-lg border border-blue-100">
            <Info className="w-3 h-3 text-blue-600 flex-shrink-0" />
            <span className="text-xs text-blue-700 font-medium">
              Select multiple project sizes for more leads
            </span>
          </div>

          {/* Select All/Deselect All Controls */}
          <div className="flex gap-2 mb-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              className="flex-1 h-7 text-xs"
              disabled={activeSubscriptions.length === SQFT_TIERS.length}
            >
              <CheckSquare className="w-3 h-3 mr-1" />
              Select All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeselectAll}
              className="flex-1 h-7 text-xs"
              disabled={activeSubscriptions.length === 0}
            >
              <Square className="w-3 h-3 mr-1" />
              Clear All
            </Button>
          </div>

          {/* Active Selections Summary */}
          {activeSubscriptions.length > 0 && (
            <div className="mb-3 p-2 bg-green-50 rounded-lg border border-green-100">
              <div className="text-xs font-medium text-green-700 mb-1">
                {activeSubscriptions.length} size{activeSubscriptions.length !== 1 ? 's' : ''} selected
              </div>
              <div className="text-xs text-green-600">
                Total cost per lead: ${totalCost.toFixed(2)}
              </div>
            </div>
          )}

          {/* SQFT Tiers */}
          <div className="space-y-2">
            {SQFT_TIERS.map((tier) => {
              const subscription = subscriptions.find(s => s.sqft_tier === tier.value);
              const isChecked = subscription?.is_active || false;
              const installChecked = subscription?.accepts_installation || false;
              const tierKey = `${brand.name}-${tier.value}`;
              const isSaving = savingStates[tierKey];

              return (
                <div 
                  key={tier.value} 
                  className={`p-3 rounded-lg border transition-all ${
                    isChecked 
                      ? 'bg-primary/5 border-primary/20 shadow-sm' 
                      : 'bg-muted/30 hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Label className="flex items-center gap-2 text-xs cursor-pointer">
                          <Checkbox 
                            checked={isChecked} 
                            onCheckedChange={(checked) => onToggleTier(brand.name, tier.value, checked as boolean)}
                            disabled={isSaving}
                          />
                          <span className={isSaving ? 'opacity-50' : 'font-medium'}>{tier.label}</span>
                        </Label>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Receive leads for {tier.label} projects</p>
                      </TooltipContent>
                    </Tooltip>
                    <span className="text-xs text-muted-foreground font-semibold">
                      ${tier.basePrice.toFixed(2)}
                    </span>
                  </div>
                  
                  {isChecked && (
                    <div className="mt-3 ml-6 pl-3 border-l-2 border-primary/20">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-2">
                            <Switch 
                              checked={installChecked} 
                              onCheckedChange={(checked) => onToggleInstall(brand.name, tier.value, checked as boolean)}
                              disabled={isSaving}
                            />
                            <span className="text-xs text-muted-foreground font-medium">
                              Include installation leads (+$0.50)
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Also receive leads that require installation services</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Help Text */}
          {activeSubscriptions.length === 0 && (
            <div className="mt-3 p-2 text-center text-xs text-muted-foreground bg-muted/30 rounded-lg">
              Select project sizes to start receiving leads for this brand
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
