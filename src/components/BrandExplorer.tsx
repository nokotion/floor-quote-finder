import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ExternalLink } from "lucide-react";
import { slugify } from "@/utils/slugUtils";
import DisplayCards from "@/components/ui/display-cards";

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
  const [loading, setLoading] = useState(true);

  const categories = [
    { 
      id: "all", 
      name: "All", 
      emoji: "🏠", 
      description: "Browse all flooring brands and options" 
    },
    { 
      id: "tile", 
      name: "Tile", 
      emoji: "🟫", 
      description: "Ceramic, porcelain, and natural stone" 
    },
    { 
      id: "vinyl", 
      name: "Vinyl", 
      emoji: "📱", 
      description: "Luxury vinyl plank and sheet options" 
    },
    { 
      id: "hardwood", 
      name: "Hardwood", 
      emoji: "🪵", 
      description: "Premium hardwood flooring options" 
    },
    { 
      id: "laminate", 
      name: "Laminate", 
      emoji: "✨", 
      description: "Durable and affordable wood-look floors" 
    },
    { 
      id: "carpet", 
      name: "Carpet", 
      emoji: "🧶", 
      description: "Soft and comfortable floor coverings" 
    },
    { 
      id: "sports", 
      name: "Sports", 
      emoji: "🏀", 
      description: "Performance flooring for gyms and sports areas" 
    }
  ];

  const displayCardsData = categories.slice(0, 3).map((category, index) => {
    const baseClassName = "[grid-area:stack] transition-all duration-700 hover:grayscale-0";
    let className = "";
    
    if (index === 0) {
      className = `${baseClassName} hover:-translate-y-10 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 before:left-0 before:top-0`;
    } else if (index === 1) {
      className = `${baseClassName} translate-x-16 translate-y-10 hover:-translate-y-1 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 before:left-0 before:top-0`;
    } else {
      className = `${baseClassName} translate-x-32 translate-y-20 hover:translate-y-10`;
    }

    // Add selected state styling
    if (selectedCategory === category.id) {
      className += " ring-2 ring-blue-500 bg-blue-50/70 grayscale-0";
    }

    return {
      className,
      icon: <span className="text-lg">{category.emoji}</span>,
      title: category.name,
      description: category.description,
      date: "",
      iconClassName: "text-blue-500",
      titleClassName: selectedCategory === category.id ? "text-blue-600" : "text-blue-500",
      onClick: () => setSelectedCategory(category.id),
    };
  });

  useEffect(() => {
    fetchBrands();
  }, []);

  useEffect(() => {
    filterBrands();
  }, [selectedCategory, brands]);

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
    if (selectedCategory === "all") {
      setFilteredBrands(brands);
    } else {
      const filtered = brands.filter(brand =>
        brand.categories?.toLowerCase().includes(selectedCategory.toLowerCase())
      );
      setFilteredBrands(filtered);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading brands...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Browse Flooring Brands
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover top flooring brands and get instant quotes from local retailers
          </p>
        </motion.div>

        {/* Category Selector - New Animated Cards */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-8 text-center">Choose a Category</h2>
          <div className="flex justify-center mb-8">
            <DisplayCards cards={displayCardsData} />
          </div>
          
          {/* Additional Categories Grid for remaining categories */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {categories.slice(3).map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: (index + 3) * 0.1 }}
              >
                <Card 
                  className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                    selectedCategory === category.id 
                      ? "ring-2 ring-blue-500 bg-blue-50 shadow-md" 
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl mb-2">{category.emoji}</div>
                    <h3 className="font-bold text-sm mb-1">{category.name}</h3>
                    <p className="text-xs text-gray-600">{category.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

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
            <p className="text-gray-500 text-lg">No brands found for this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBrands.map((brand, index) => (
              <motion.div
                key={brand.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className="h-full group hover:shadow-xl transition-all duration-300">
                  <Link to={`/brand/${brand.slug}`} className="block">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          {brand.logo_url ? (
                            <img 
                              src={brand.logo_url} 
                              alt={`${brand.name} logo`}
                              className="h-12 w-auto mb-3"
                            />
                          ) : (
                            <div className="h-12 w-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center mb-3">
                              <span className="text-blue-600 font-bold text-lg">
                                {brand.name.charAt(0)}
                              </span>
                            </div>
                          )}
                          <h3 className="text-xl font-semibold group-hover:text-blue-600 transition-colors">
                            {brand.name}
                          </h3>
                          {brand.description && (
                            <p className="text-gray-600 mt-2 text-sm line-clamp-3">
                              {brand.description}
                            </p>
                          )}
                        </div>
                        {brand.website_url && (
                          <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {brand.categories?.split(',').map((category, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {category.trim()}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Link>
                  <div className="px-6 pb-6">
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
