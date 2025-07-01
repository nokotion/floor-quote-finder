
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import BrandExplorer from "@/components/BrandExplorer";

const Browse = () => {
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
                className="h-12 md:h-16 lg:h-20 w-auto"
              />
            </Link>
            <div className="flex items-center space-x-4">
              <Button variant="outline" asChild>
                <Link to="/">Home</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/auth">Retailer Portal</Link>
              </Button>
              <Button asChild>
                <Link to="/quote">Get Quote</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Brand Explorer Component */}
      <BrandExplorer />
    </div>
  );
};

export default Browse;
