import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDevMode, DevRole } from '@/contexts/DevModeContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  ChevronDown, 
  ChevronUp, 
  Home, 
  Shield, 
  Store,
  Users,
  BarChart3,
  MapPin,
  CreditCard,
  FileText,
  Package,
  Quote,
  Search
} from 'lucide-react';

export const DevModePanel = () => {
  const { isDevMode, currentRole, setCurrentRole } = useDevMode();
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  if (!isDevMode) return null;

  const handleRoleChange = (role: DevRole) => {
    setCurrentRole(role);
    // Navigate to appropriate dashboard
    if (role === 'admin') {
      navigate('/admin/dashboard');
    } else if (role === 'retailer') {
      navigate('/retailer/dashboard');
    } else {
      navigate('/');
    }
  };

  const publicRoutes = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/quote', label: 'Quote', icon: Quote },
    { path: '/browse', label: 'Browse', icon: Search },
  ];

  const adminRoutes = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: BarChart3 },
    { path: '/admin/retailers', label: 'Retailers', icon: Store },
    { path: '/admin/brands', label: 'Brands', icon: Package },
    { path: '/admin/users', label: 'Users', icon: Users },
    { path: '/admin/applications', label: 'Applications', icon: FileText },
    { path: '/admin/leads', label: 'Leads', icon: Users },
    { path: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  const retailerRoutes = [
    { path: '/retailer/dashboard', label: 'Dashboard', icon: BarChart3 },
    { path: '/retailer/leads', label: 'Leads', icon: Users },
    { path: '/retailer/subscriptions', label: 'Subscriptions', icon: Package },
    { path: '/retailer/coverage', label: 'Coverage Map', icon: MapPin },
    { path: '/retailer/billing', label: 'Billing', icon: CreditCard },
    { path: '/retailer/settings', label: 'Settings', icon: Settings },
  ];

  const getCurrentRoutes = () => {
    switch (currentRole) {
      case 'admin': return adminRoutes;
      case 'retailer': return retailerRoutes;
      default: return publicRoutes;
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-80 bg-card/95 backdrop-blur-sm border-2 border-accent shadow-lg">
        <CardHeader 
          className="pb-2 cursor-pointer" 
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-accent" />
              <CardTitle className="text-sm">Dev Mode</CardTitle>
              <Badge variant="secondary" className="bg-accent/20 text-accent">
                {currentRole.toUpperCase()}
              </Badge>
            </div>
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </CardHeader>
        
        {isExpanded && (
          <CardContent className="pt-0 space-y-4">
            {/* Role Switcher */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">Switch Role:</p>
              <div className="flex gap-1">
                <Button 
                  size="sm" 
                  variant={currentRole === 'public' ? 'default' : 'outline'}
                  onClick={() => handleRoleChange('public')}
                  className="flex-1 text-xs"
                >
                  Public
                </Button>
                <Button 
                  size="sm" 
                  variant={currentRole === 'admin' ? 'default' : 'outline'}
                  onClick={() => handleRoleChange('admin')}
                  className="flex-1 text-xs"
                >
                  Admin
                </Button>
                <Button 
                  size="sm" 
                  variant={currentRole === 'retailer' ? 'default' : 'outline'}
                  onClick={() => handleRoleChange('retailer')}
                  className="flex-1 text-xs"
                >
                  Retailer
                </Button>
              </div>
            </div>

            <Separator />

            {/* Quick Navigation */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">Quick Navigation:</p>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {getCurrentRoutes().map((route) => {
                  const Icon = route.icon;
                  const isActive = location.pathname === route.path;
                  
                  return (
                    <Button
                      key={route.path}
                      size="sm"
                      variant={isActive ? 'secondary' : 'ghost'}
                      onClick={() => navigate(route.path)}
                      className="w-full justify-start text-xs h-8"
                    >
                      <Icon className="h-3 w-3 mr-2" />
                      {route.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};