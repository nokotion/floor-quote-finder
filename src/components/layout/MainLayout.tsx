import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield } from "lucide-react";
import { Link } from "react-router-dom";

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link to="/" className="flex items-center">
              <img 
                src="https://syjxtyvsencbmhuprnyu.supabase.co/storage/v1/object/public/pricemyfloor-files//pricemyfloor%20_logo.png" 
                alt="Price My Floor Logo" 
                className="h-16 md:h-20 lg:h-24 w-auto"
                style={{ maxHeight: '72px' }}
              />
            </Link>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <Shield className="w-3 h-3 mr-1" />
                Verified Retailers Only
              </Badge>
              <Button variant="outline" asChild>
                <Link to="/browse">Browse</Link>
              </Button>
              <Button asChild>
                <Link to="/quote">Get Quote</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {children}
    </div>
  );
};