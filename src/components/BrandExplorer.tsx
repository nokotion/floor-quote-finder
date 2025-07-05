
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ExternalLink, Search } from "lucide-react";
import { slugify } from "@/utils/slugUtils";
import FlooringCategories from "@/components/ui/flooring-categories";

const categoryIcons: Record<string, string> = {
  vinyl: "📋",
  laminate: "✨", 
  hardwood: "🌳",
  tile: "🔲",
  carpet: "🧶",
  commercial: "🏢"
};

interface Brand {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  website_url?: string;
  categories: string;
  slug: string;
}

const BrandExplorer = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [filteredBrands, setFilteredBrands] = useState<Brand[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: "all", name: "All" },
    { id: "vinyl", name: "Vinyl" },
    { id: "laminate", name: "Laminate" },
    { id: "hardwood", name: "Hardwood" },
    { id: "tile", name: "Tile" },
    { id: "commercial", name: "Commercial" },
    { id: "carpet", name: "Carpet" }
  ];

  useEffect(() => {
    fetchBrands();
  }, []);

  useEffect(() => {
    filterBrands();
  }, [selectedCategory, searchQuery, brands]);

  const fetchBrands = async () => {
    try {
      const { data, error } = await supabase
        .from('flooring_brands')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setBrands(data || []);
    } catch (error) {
      console.error('Error fetching brands:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterBrands = () => {
    let filtered = brands;

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(brand => {
        if (!brand.categories) return false;
        const brandCategories = brand.categories.split(',').map(cat => cat.trim().toLowerCase());
        return brandCategories.includes(selectedCategory.toLowerCase());
      });
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(brand =>
        brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (brand.description && brand.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredBrands(filtered);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading brands...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Browse All Flooring Brands
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Explore our network of trusted flooring brands and get instant quotes
          </p>
          
          {/* Search Bar */}
          <div className="max-w-md mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full"
              />
            </div>
          </div>
        </motion.div>

        {/* Category Tabs */}
        <FlooringCategories 
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
        />

        {/* Results Header */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-semibold">
            {selectedCategory === "all" ? "All Brands" : `${categories.find(c => c.id === selectedCategory)?.name} Brands`}
          </h2>
          <Badge variant="secondary" className="text-lg px-3 py-1">
            {filteredBrands.length} brands
          </Badge>
        </div>

        {/* Brand Grid */}
        {filteredBrands.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {searchQuery.trim() 
                ? `No brands found matching "${searchQuery}"`
                : "No brands found for this category."
              }
            </p>
            {searchQuery.trim() && (
              <p className="text-gray-400 text-sm mt-2">
                Try adjusting your search or selecting a different category.
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredBrands.map((brand, index) => (
              <motion.div
                key={brand.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="h-full"
              >
                <Card className="h-full group hover:shadow-xl transition-all duration-300 flex flex-col">
                  <Link to={`/brand/${brand.slug}`} className="flex-1 flex flex-col">
                    <CardContent className="p-4 flex-1 flex flex-col">
                      {/* Logo Section */}
                      <div className="flex flex-col items-center text-center mb-4">
                        {brand.logo_url ? (
                          <img 
                            src={brand.logo_url} 
                            alt={`${brand.name} logo`}
                            className="h-20 w-auto object-contain mb-3"
                          />
                        ) : (
                          <div className="h-20 w-20 bg-gradient-to-br from-accent/20 to-accent/30 rounded-lg flex items-center justify-center mb-3">
                            <span className="text-accent-foreground font-bold text-2xl">
                              {brand.name.charAt(0)}
                            </span>
                          </div>
                        )}
                        
                        {/* Brand Name */}
                        <h3 className="text-lg font-bold group-hover:text-accent transition-colors line-clamp-2 min-h-[2.5rem] flex items-center">
                          {brand.name}
                        </h3>
                      </div>
                      
                      {/* Category Icons */}
                      <div className="flex justify-center gap-2 mb-4 min-h-[1.5rem]">
                        {brand.categories && brand.categories.trim() && 
                          brand.categories.split(',')
                            .map(cat => cat.trim().toLowerCase())
                            .filter(cat => categoryIcons[cat])
                            .slice(0, 3)
                            .map((category, idx) => (
                              <span key={idx} className="text-xl" title={category}>
                                {categoryIcons[category]}
                              </span>
                            ))
                        }
                      </div>
                      
                      {/* Website Icon */}
                      <div className="flex justify-center">
                        {brand.website_url && (
                          <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-accent transition-colors" />
                        )}
                      </div>
                    </CardContent>
                  </Link>
                  
                  {/* Get Quote Button - Always at bottom */}
                  <div className="p-4 pt-0 mt-auto">
                    <Button asChild className="w-full">
                      <Link to={`/quote?brand=${encodeURIComponent(brand.name)}`}>
                        Get Quote
                      </Link>
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandExplorer;
