import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { Footer7 } from "@/components/ui/footer-7";

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Announcement Bar */}
      <div className="bg-orange-50 border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="h-10 flex items-center justify-center">
            <p className="text-xs sm:text-sm font-medium text-orange-600">
              🚫 No MSRP Markups — Just Local Prices
            </p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo - Left */}
            <Link to="/" className="flex-shrink-0">
              <img 
                src="https://syjxtyvsencbmhuprnyu.supabase.co/storage/v1/object/public/pricemyfloor-files//pricemyfloor%20_logo.png" 
                alt="Price My Floor Logo" 
                className="h-12 w-auto"
              />
            </Link>
            
            {/* Tagline - Center */}
            <div className="hidden lg:flex flex-1 justify-center px-4">
              <p className="text-sm font-medium text-gray-500">
                Canada's Largest Flooring Retailer Directory
              </p>
            </div>
            
            {/* Actions - Right */}
            <div className="flex items-center space-x-3">
              {/* Verified Badge */}
              <Badge className="hidden md:flex bg-green-50 text-green-700 border border-green-200 rounded-full text-xs px-3 py-1.5">
                <span className="text-green-600 mr-1">🟢</span>
                Verified Retailers Only
              </Badge>
              
              {/* Browse Button */}
              <Button variant="outline" size="sm" className="rounded-lg" asChild>
                <Link to="/browse">
                  <span className="hidden sm:inline">Browse Brands</span>
                  <span className="sm:hidden">Browse</span>
                </Link>
              </Button>
              
              {/* Mobile Menu Toggle */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {children}
      
      <Footer7 />
    </div>
  );
};