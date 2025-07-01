import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ExternalLink } from "lucide-react";

interface Brand {
  id: string;
  name: string;
  description: string;
  logo_url: string;
  categories: string;
  website: string;
  installation: string;
  slug: string;
}

const BrandDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [brand, setBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchBrand = async () => {
      if (!slug) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      console.log(`Fetching brand with slug: ${slug}`);
      
      const { data, error } = await supabase
        .from("flooring_brands")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      
      if (error) {
        console.error("Error fetching brand:", error);
        setNotFound(true);
      } else if (!data) {
        console.log("Brand not found");
        setNotFound(true);
      } else {
        console.log("Fetched brand:", data);
        setBrand(data);
      }
      setLoading(false);
    };
    
    fetchBrand();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen py-16 px-4 bg-gradient-to-br from-slate-50 to-blue-50">
        {/* Navigation */}
        <nav className="bg-white/90 backdrop-blur-sm border-b sticky top-0 z-50 mb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link to="/" className="flex items-center">
                <img 
                  src="https://syjxtyvsencbmhuprnyu.supabase.co/storage/v1/object/public/pricemyfloor-files//pricemyfloor%20_logo.png" 
                  alt="Price My Floor Logo" 
                  className="h-8 w-auto mr-3"
                />
                <span className="font-bold text-2xl text-blue-600">
                  Price My Floor
                </span>
              </Link>
              <div className="flex items-center space-x-4">
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

        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-8 w-32 mb-6" />
          <Card>
            <CardContent className="p-8">
              <div className="flex items-start gap-8">
                <Skeleton className="h-24 w-24 rounded" />
                <div className="flex-1">
                  <Skeleton className="h-8 w-64 mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4 mb-4" />
                  <Skeleton className="h-10 w-32" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (notFound || !brand) {
    return (
      <div className="min-h-screen py-16 px-4 bg-gradient-to-br from-slate-50 to-blue-50">
        {/* Navigation */}
        <nav className="bg-white/90 backdrop-blur-sm border-b sticky top-0 z-50 mb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link to="/" className="flex items-center">
                <img 
                  src="https://syjxtyvsencbmhuprnyu.supabase.co/storage/v1/object/public/pricemyfloor-files//pricemyfloor%20_logo.png" 
                  alt="Price My Floor Logo" 
                  className="h-8 w-auto mr-3"
                />
                <span className="font-bold text-2xl text-blue-600">
                  Price My Floor
                </span>
              </Link>
              <div className="flex items-center space-x-4">
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

        <div className="max-w-4xl mx-auto text-center py-20">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-3xl font-bold mb-4">Brand Not Found</h1>
          <p className="text-gray-600 mb-8">
            The brand you're looking for doesn't exist or may have been moved.
          </p>
          <Button asChild>
            <Link to="/browse">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Browse All Brands
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16 px-4 bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-sm border-b sticky top-0 z-50 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center">
              <img 
                src="https://syjxtyvsencbmhuprnyu.supabase.co/storage/v1/object/public/pricemyfloor-files//pricemyfloor%20_logo.png" 
                alt="Price My Floor Logo" 
                className="h-8 w-auto mr-3"
              />
              <span className="font-bold text-2xl text-blue-600">
                Price My Floor
              </span>
            </Link>
            <div className="flex items-center space-x-4">
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

      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Button variant="ghost" asChild className="hover:bg-gray-100">
            <Link to="/browse">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Browse
            </Link>
          </Button>
        </div>

        {/* Brand Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex items-start gap-8">
              {/* Brand Logo */}
              <div className="flex-shrink-0">
                {brand.logo_url ? (
                  <img
                    src={brand.logo_url}
                    alt={`${brand.name} logo`}
                    className="h-24 w-24 object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={`w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center text-blue-600 font-bold text-2xl ${brand.logo_url ? 'hidden' : ''}`}>
                  {brand.name ? brand.name.charAt(0).toUpperCase() : '?'}
                </div>
              </div>

              {/* Brand Info */}
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-4 text-gray-800">
                  {brand.name || 'Unknown Brand'}
                </h1>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {brand.description || 'Premium flooring solutions for your home and business.'}
                </p>

                <div className="flex flex-wrap gap-4">
                  <Button asChild size="lg">
                    <Link to={`/quote?brand=${encodeURIComponent(brand.name || '')}`}>
                      Get Quote for {brand.name}
                    </Link>
                  </Button>
                  
                  {brand.website && (
                    <Button variant="outline" size="lg" asChild>
                      <a 
                        href={brand.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center"
                      >
                        Visit Website
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Brand Details */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Categories */}
          {brand.categories && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Product Categories</h3>
                <p className="text-gray-600">{brand.categories}</p>
              </CardContent>
            </Card>
          )}

          {/* Installation */}
          {brand.installation && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Installation Options</h3>
                <p className="text-gray-600">{brand.installation}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Placeholder for Future Image Showcase */}
        <Card className="mt-8">
          <CardContent className="p-8 text-center">
            <h3 className="text-xl font-semibold mb-4">Product Showcase</h3>
            <p className="text-gray-500 mb-4">
              Product images and installation photos will be displayed here.
            </p>
            <div className="bg-gray-100 rounded-lg h-48 flex items-center justify-center">
              <span className="text-gray-400">Coming Soon</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BrandDetail;
