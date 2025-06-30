
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { slugify } from "@/utils/slugUtils";

interface Brand {
  id: string;
  name: string;
  description: string;
  logo_url: string;
  categories: string;
  slug: string;
}

const FLOOR_TYPES = ["Tile", "Vinyl", "Hardwood", "Laminate", "Carpet", "Stone", "Engineered Wood"];

export default function BrandExplorer() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState("Tile");

  useEffect(() => {
    const fetchBrands = async () => {
      setLoading(true);
      console.log(`Fetching brands for category: ${activeType}`);
      
      const { data, error } = await supabase
        .from("flooring_brands")
        .select("id, name, description, logo_url, categories, slug")
        .ilike("categories", `%${activeType}%`);
      
      if (error) {
        console.error("Error fetching brands:", error);
        setBrands([]);
      } else {
        console.log("Fetched brands:", data);
        setBrands(data || []);
      }
      setLoading(false);
    };
    
    fetchBrands();
  }, [activeType]);

  return (
    <div className="min-h-screen py-16 px-4 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-4">
          Browse {activeType} Brands
        </h1>
        <p className="text-xl text-gray-600 text-center mb-10">
          Discover premium flooring brands and get instant quotes
        </p>

        {/* Floor type tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {FLOOR_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              className={`px-6 py-3 rounded-full text-sm font-medium border-2 transition-all duration-200 ${
                activeType === type
                  ? "bg-blue-600 text-white border-blue-600 shadow-lg transform scale-105"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-blue-300"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Brand cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="h-48">
                  <CardContent className="p-6">
                    <Skeleton className="h-16 w-16 mx-auto mb-4 rounded" />
                    <Skeleton className="h-4 w-3/4 mx-auto mb-2" />
                    <Skeleton className="h-3 w-full mb-1" />
                    <Skeleton className="h-3 w-5/6 mx-auto" />
                  </CardContent>
                </Card>
              ))
            : brands.length === 0 ? (
                <div className="col-span-full text-center py-20">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-2xl font-semibold mb-2">No brands found</h3>
                  <p className="text-gray-600">
                    We're currently updating our {activeType.toLowerCase()} brand selection.
                  </p>
                </div>
              )
            : brands.map((brand) => (
                <div key={brand.id} className="group">
                  <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white border-2 hover:border-blue-200">
                    {/* Main brand card area - links to brand detail page */}
                    <Link
                      to={`/brand/${brand.slug || slugify(brand.name || '')}`}
                      className="block"
                    >
                      <CardContent className="p-6 flex flex-col items-center text-center h-full">
                        <div className="flex-shrink-0 mb-4">
                          {brand.logo_url ? (
                            <img
                              src={brand.logo_url}
                              alt={`${brand.name} logo`}
                              className="h-16 w-16 object-contain mx-auto"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <div className={`w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center text-blue-600 font-bold text-xl mx-auto ${brand.logo_url ? 'hidden' : ''}`}>
                            {brand.name ? brand.name.charAt(0).toUpperCase() : '?'}
                          </div>
                        </div>
                        
                        <div className="flex-grow flex flex-col justify-between">
                          <div>
                            <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-600 transition-colors">
                              {brand.name || 'Unknown Brand'}
                            </h3>
                            <p className="text-sm text-gray-600 line-clamp-3">
                              {brand.description || 'Premium flooring solutions for your home.'}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Link>
                    
                    {/* Separate Get Quote button */}
                    <div className="p-4 pt-0">
                      <Button 
                        size="sm" 
                        className="w-full" 
                        asChild
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Link to={`/quote?brand=${encodeURIComponent(brand.name || '')}`}>
                          Get Quote
                        </Link>
                      </Button>
                    </div>
                  </Card>
                </div>
              ))}
        </div>
      </div>
    </div>
  );
}
