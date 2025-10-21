import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ExternalLink, CheckCircle, MessageCircle, ShoppingBag, Wrench, Link as LinkIcon, Grid3x3 } from "lucide-react";

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

// Mock data for featured collections - can be moved to database later
const getFeaturedCollections = (brandName: string) => [
  {
    id: 1,
    name: "Heritage Hardwood",
    description: "Timeless natural look with premium finishes",
    link: "#"
  },
  {
    id: 2,
    name: "Vinyl Select",
    description: "Waterproof durability for modern living",
    link: "#"
  },
  {
    id: 3,
    name: "Laminate Classic",
    description: "Modern patterns with easy installation",
    link: "#"
  },
  {
    id: 4,
    name: "Premium Tile",
    description: "Elegant stone-look luxury vinyl tile",
    link: "#"
  }
];

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

      const { data, error } = await supabase
        .from("flooring_brands")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      
      if (error || !data) {
        setNotFound(true);
      } else {
        setBrand(data);
      }
      setLoading(false);
    };
    
    fetchBrand();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-8 w-48 mb-8" />
          <Card>
            <CardContent className="p-8">
              <div className="flex items-start gap-8">
                <Skeleton className="h-32 w-32 rounded" />
                <div className="flex-1">
                  <Skeleton className="h-10 w-64 mb-4" />
                  <Skeleton className="h-6 w-full mb-2" />
                  <Skeleton className="h-12 w-48 mt-6" />
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
      <div className="min-h-screen bg-background py-16 px-4">
        <div className="max-w-4xl mx-auto text-center py-20">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-3xl font-bold mb-4">Brand Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The brand you're looking for doesn't exist or may have been moved.
          </p>
          <Button asChild variant="default">
            <Link to="/browse">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Browse All Brands
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const collections = getFeaturedCollections(brand.name);
  const categories = brand.categories?.split(',').map(cat => cat.trim()).filter(Boolean) || [];
  const installationOptions = brand.installation?.split(',').map(opt => opt.trim()).filter(Boolean) || ['Click Lock', 'Glue Down', 'Nail Down'];

  return (
    <div className="min-h-screen bg-background">
      {/* Back Navigation */}
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Button variant="ghost" asChild className="hover:bg-accent">
            <Link to="/browse">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Browse All Brands
            </Link>
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 space-y-16">
        {/* Header Section */}
        <section>
          <Card className="border-none shadow-lg">
            <CardContent className="p-12">
              <div className="flex flex-col md:flex-row items-start gap-12">
                {/* Brand Logo */}
                <div className="flex-shrink-0">
                  {brand.logo_url ? (
                    <img
                      src={brand.logo_url}
                      alt={`${brand.name} logo`}
                      className="h-32 w-32 object-contain rounded-lg"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-gradient-to-br from-primary/10 to-primary/20 rounded-lg flex items-center justify-center text-primary font-bold text-4xl">
                      {brand.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Brand Info */}
                <div className="flex-1">
                  <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
                    {brand.name}
                  </h1>
                  <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                    {brand.description || 'Premium flooring solutions for your home and business.'}
                  </p>

                  <div className="flex flex-wrap gap-4">
                    <Button asChild size="lg" className="font-semibold">
                      <Link to={`/quote?brand=${encodeURIComponent(brand.name)}`}>
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
        </section>

        {/* Featured Collections */}
        <section>
          <h2 className="text-3xl font-bold mb-8 text-foreground">Featured Collections</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {collections.map((collection) => (
              <Card key={collection.id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-2 text-foreground group-hover:text-primary transition-colors">
                    {collection.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6 line-clamp-2">
                    {collection.description}
                  </p>
                  <Button variant="outline" size="sm" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors" asChild>
                    <a href={brand.website || "#"} target="_blank" rel="noopener noreferrer">
                      View Collection
                      <ExternalLink className="w-3 h-3 ml-2" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Categories and Installation Options */}
        <div className="grid md:grid-cols-2 gap-12">
          {/* Product Categories */}
          <section>
            <h2 className="text-2xl font-bold mb-6 text-foreground">Available Categories</h2>
            <div className="flex flex-wrap gap-3">
              {categories.length > 0 ? (
                categories.map((category, index) => (
                  <Badge key={index} variant="secondary" className="px-4 py-2 text-sm font-medium">
                    {category}
                  </Badge>
                ))
              ) : (
                <Badge variant="secondary" className="px-4 py-2 text-sm">Hardwood</Badge>
              )}
            </div>
          </section>

          {/* Installation Options */}
          <section>
            <h2 className="text-2xl font-bold mb-6 text-foreground">Installation Options</h2>
            <div className="flex flex-wrap gap-4">
              {installationOptions.map((option, index) => (
                <div key={index} className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Wrench className="w-4 h-4 text-primary" />
                  {option}
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Why Choose PriceMyFloor */}
        <section className="bg-gradient-to-br from-muted/50 to-muted/30 rounded-2xl p-12">
          <h2 className="text-3xl font-bold mb-12 text-center text-foreground">Why Choose PriceMyFloor</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Verified Retailers Only</h3>
              <p className="text-muted-foreground">Connect with licensed, insured professionals in your area</p>
            </div>
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary">
                <MessageCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Instant Quotes from Local Stores</h3>
              <p className="text-muted-foreground">Get competitive pricing from multiple retailers near you</p>
            </div>
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">No Online MSRP Markups</h3>
              <p className="text-muted-foreground">Direct retailer pricing without middleman costs</p>
            </div>
          </div>
        </section>

        {/* Product Showcase */}
        <section>
          <h2 className="text-3xl font-bold mb-8 text-foreground">Product Showcase</h2>
          <Card>
            <CardContent className="p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                  <div 
                    key={item}
                    className="aspect-square bg-muted rounded-lg flex items-center justify-center group cursor-pointer hover:bg-muted/80 transition-all relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="text-muted-foreground group-hover:text-white relative z-10 text-sm font-medium px-2 text-center">
                      View on {brand.name}
                    </span>
                  </div>
                ))}
              </div>
              <div className="text-center">
                <Button variant="outline" size="lg" asChild>
                  <a href={brand.website || "#"} target="_blank" rel="noopener noreferrer">
                    View All on Brand Website
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Final CTA */}
        <section className="relative">
          <Card className="border-none shadow-2xl overflow-hidden">
            <CardContent className="p-16 text-center relative">
              {/* Faded Brand Logo Background */}
              {brand.logo_url && (
                <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                  <img src={brand.logo_url} alt="" className="h-64 w-64 object-contain" />
                </div>
              )}
              
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                  Ready to find a retailer that carries {brand.name}?
                </h2>
                <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Get instant quotes from verified local retailers and compare pricing for {brand.name} products.
                </p>
                <Button asChild size="lg" className="text-lg px-12 py-6 h-auto font-semibold">
                  <Link to={`/quote?brand=${encodeURIComponent(brand.name)}`}>
                    Get Quote for {brand.name}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default BrandDetail;
