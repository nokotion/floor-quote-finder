
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { ChevronRight, Search, Star, MapPin } from "lucide-react";

const flooringBrands = {
  hardwood: [
    { name: "Bruce Hardwood", logo: "🏆", rating: 4.8, description: "Premium hardwood flooring with 100+ years of craftsmanship", verified: true },
    { name: "Shaw Floors", logo: "🌟", rating: 4.7, description: "Innovative hardwood solutions for modern homes", verified: true },
    { name: "Mohawk Flooring", logo: "🎯", rating: 4.6, description: "Sustainable hardwood with lifetime warranties", verified: true },
  ],
  tile: [
    { name: "Daltile", logo: "🏛️", rating: 4.9, description: "Designer tiles for kitchens, bathrooms, and more", verified: true },
    { name: "Marazzi", logo: "🎨", rating: 4.7, description: "Italian-inspired ceramic and porcelain tiles", verified: true },
    { name: "American Olean", logo: "🇺🇸", rating: 4.5, description: "Classic and contemporary tile designs", verified: true },
  ],
  vinyl: [
    { name: "Luxury Vinyl Pro", logo: "💎", rating: 4.8, description: "Waterproof luxury vinyl planks and tiles", verified: true },
    { name: "LifeProof", logo: "🛡️", rating: 4.6, description: "Pet and kid-friendly vinyl flooring", verified: true },
    { name: "CoreTec", logo: "⚡", rating: 4.7, description: "Rigid core luxury vinyl with superior durability", verified: true },
  ],
  carpet: [
    { name: "Stainmaster", logo: "🧽", rating: 4.5, description: "Stain-resistant carpets for busy households", verified: true },
    { name: "Mohawk SmartStrand", logo: "🌿", rating: 4.6, description: "Eco-friendly carpet made from recycled materials", verified: true },
    { name: "Shaw Floors Carpet", logo: "🏠", rating: 4.4, description: "Comfortable and stylish carpet solutions", verified: true },
  ],
};

const categories = [
  { name: "All", key: "all" },
  { name: "Hardwood", key: "hardwood" },
  { name: "Tile", key: "tile" },
  { name: "Vinyl", key: "vinyl" },
  { name: "Carpet", key: "carpet" },
  { name: "Laminate", key: "laminate" },
  { name: "Stone", key: "stone" },
];

const Browse = () => {
  const [searchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [searchTerm, setSearchTerm] = useState('');

  const getAllBrands = () => {
    return Object.values(flooringBrands).flat();
  };

  const getFilteredBrands = () => {
    let brands = selectedCategory === 'all' ? getAllBrands() : (flooringBrands[selectedCategory as keyof typeof flooringBrands] || []);
    
    if (searchTerm) {
      brands = brands.filter(brand => 
        brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        brand.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return brands;
  };

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

      {/* Header */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Browse Flooring Brands
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Discover verified retailers and premium flooring brands
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            className="max-w-md mx-auto mb-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search brands..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 text-lg"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Category Filters */}
      <section className="px-4 mb-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <Button
                key={category.key}
                variant={selectedCategory === category.key ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.key)}
                className="rounded-full"
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Grid */}
      <section className="px-4 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {getFilteredBrands().map((brand, index) => (
              <motion.div
                key={`${brand.name}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white border-2 hover:border-blue-200">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">{brand.logo}</div>
                        <div>
                          <CardTitle className="text-xl">{brand.name}</CardTitle>
                          {brand.verified && (
                            <Badge className="mt-1 bg-green-100 text-green-800">
                              <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                              Verified
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{brand.rating}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-6">{brand.description}</p>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                      <MapPin className="w-4 h-4" />
                      <span>Available across Canada</span>
                    </div>
                    
                    <Button className="w-full" asChild>
                      <Link to={`/quote?brand=${encodeURIComponent(brand.name)}`} className="inline-flex items-center justify-center">
                        Get Quote <ChevronRight className="ml-2 w-4 h-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {getFilteredBrands().length === 0 && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-semibold mb-2">No brands found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Browse;
