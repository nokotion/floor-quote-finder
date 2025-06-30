
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import BrandExplorer from "@/components/BrandExplorer";

const Browse = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="font-bold text-2xl text-blue-600">
              Price My Floor
            </Link>
            <div className="flex items-center space-x-4">
              <Button variant="outline" asChild>
                <Link to="/">Home</Link>
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
