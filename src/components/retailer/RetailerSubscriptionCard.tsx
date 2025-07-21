
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { SQFT_TIERS } from "@/constants/flooringData";

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
}

export default function RetailerSubscriptionCard({ 
  brand, 
  subscriptions, 
  onToggleTier, 
  onToggleInstall 
}: RetailerSubscriptionCardProps) {
  const activeSubscriptions = subscriptions.filter(s => s.is_active);
  const categoriesArray = brand.categories ? brand.categories.split(',').map(c => c.trim()) : [];

  return (
    <Card className="w-full max-w-xs p-3 border rounded-xl shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {brand.logo_url && (
            <img 
              src={brand.logo_url} 
              alt={brand.name} 
              className="w-5 h-5 rounded-sm object-contain flex-shrink-0" 
            />
          )}
          <span className="font-semibold text-sm truncate max-w-[140px]">{brand.name}</span>
        </div>
        <div className="flex items-center gap-1">
          {brand.featured && (
            <Badge variant="secondary" className="text-xs px-2 py-0.5">Featured</Badge>
          )}
          {activeSubscriptions.length > 0 && (
            <Badge variant="default" className="text-xs px-2 py-0.5">Active</Badge>
          )}
        </div>
      </div>

      <div className="text-xs text-muted-foreground mb-3">
        {categoriesArray.join(", ")}
      </div>

      <div className="space-y-2">
        {SQFT_TIERS.map((tier) => {
          const subscription = subscriptions.find(s => s.sqft_tier === tier.value);
          const isChecked = subscription?.is_active || false;
          const installChecked = subscription?.accepts_installation || false;

          return (
            <div key={tier.value} className="bg-muted/30 p-2 rounded-lg border">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2 text-xs cursor-pointer">
                  <Checkbox 
                    checked={isChecked} 
                    onCheckedChange={(checked) => onToggleTier(brand.name, tier.value, checked as boolean)} 
                  />
                  <span>{tier.label}</span>
                </Label>
                <span className="text-xs text-muted-foreground font-medium">
                  ${tier.basePrice.toFixed(2)}
                </span>
              </div>
              {isChecked && (
                <div className="mt-2 flex items-center gap-2 pl-6">
                  <Switch 
                    checked={installChecked} 
                    onCheckedChange={(checked) => onToggleInstall(brand.name, tier.value, checked as boolean)} 
                  />
                  <span className="text-xs text-muted-foreground">
                    Accept installation leads (+$0.50)
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
