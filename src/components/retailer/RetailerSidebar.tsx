
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Settings, 
  Package,
  MapPin
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/retailer', icon: LayoutDashboard },
  { name: 'My Leads', href: '/retailer/leads', icon: Users },
  { name: 'Subscriptions', href: '/retailer/subscriptions', icon: Package },
  { name: 'Coverage Map', href: '/retailer/coverage-map', icon: MapPin },
  { name: 'Billing', href: '/retailer/billing', icon: CreditCard },
  { name: 'Settings', href: '/retailer/settings', icon: Settings },
];

const RetailerSidebar = () => {
  const location = useLocation();

  return (
    <div className="flex flex-col w-64 bg-white border-r border-gray-200">
      <div className="flex items-center justify-center h-16 px-6 border-b border-gray-200">
        <img 
          src="https://syjxtyvsencbmhuprnyu.supabase.co/storage/v1/object/public/pricemyfloor-files//pricemyfloor%20_logo.png" 
          alt="Price My Floor Retailer" 
          className="h-10 w-auto"
        />
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default RetailerSidebar;
