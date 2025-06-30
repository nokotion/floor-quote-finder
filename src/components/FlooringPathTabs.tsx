
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Zap, Search } from "lucide-react";

interface Brand {
  id: string;
  name: string;
}

const FlooringPathTabs = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandCounts, setBrandCounts] = useState<Record<string, number>>({});
  const [selectedBrand, setSelectedBrand] = useState("");
  const [projectSize, setProjectSize] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [brandCountsLoading, setBrandCountsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("quick");
  const navigate = useNavigate();

  const flooringTypes = [
    { name: "Tile", emoji: "🔲", description: "Ceramic, porcelain, and natural stone" },
    { name: "Vinyl", emoji: "📱", description: "Luxury vinyl plank and sheet vinyl" },
    { name: "Hardwood", emoji: "🪵", description: "Solid and engineered hardwood floors" },
    { name: "Laminate", emoji: "✨", description: "Durable and affordable wood-look floors" },
    { name: "Carpet", emoji: "🏠", description: "Soft and comfortable floor coverings" }
  ];

  const projectSizes = [
    { value: "100-less", label: "100 and less" },
    { value: "100-500", label: "100–500" },
    { value: "500-1000", label: "500–1,000" },
    { value: "1000-5000", label: "1,000–5,000" },
    { value: "5000+", label: "5,000+" }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch brands
        const { data: brandsData, error: brandsError } = await supabase
          .from('flooring_brands')
          .select('id, name, categories')
          .order('name');
        
        if (brandsError) throw brandsError;
        setBrands(brandsData || []);

        // Calculate brand counts
        const counts: Record<string, number> = {};
        flooringTypes.forEach(type => {
          counts[type.name] = brandsData?.filter(brand => 
            brand.categories?.toLowerCase().includes(type.name.toLowerCase())
          ).length || 0;
        });
        setBrandCounts(counts);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setBrandCountsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleQuickQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBrand || !projectSize || !postalCode) return;

    // Validate Canadian postal code format
    const postalCodeRegex = /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/;
    if (!postalCodeRegex.test(postalCode.toUpperCase().replace(/\s/g, '').replace(/(.{3})/, '$1 '))) {
      return;
    }

    setIsLoading(true);
    
    const params = new URLSearchParams({
      brand: selectedBrand,
      size: projectSize,
      postal: postalCode.toUpperCase()
    });

    navigate(`/quote?${params.toString()}`);
  };

  const validatePostalCode = (code: string) => {
    const formatted = code.toUpperCase().replace(/\s/g, '');
    const postalCodeRegex = /^[A-Z]\d[A-Z]\d[A-Z]\d$/;
    return postalCodeRegex.test(formatted);
  };

  const isFormValid = selectedBrand && projectSize && postalCode && validatePostalCode(postalCode);

  return (
    <section className="py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold mb-4">How would you like to get started?</h2>
          <p className="text-lg text-gray-600">Choose your preferred path to find the perfect flooring</p>
        </motion.div>

        {/* Custom Tab Switcher */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-gray-100 rounded-full p-1 shadow-sm">
            <button
              onClick={() => setActiveTab("quick")}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium text-sm transition-all duration-200 ${
                activeTab === "quick"
                  ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-200"
              }`}
            >
              <Zap className="w-4 h-4" />
              I Know What I Want
            </button>
            <button
              onClick={() => setActiveTab("explore")}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium text-sm transition-all duration-200 ${
                activeTab === "explore"
                  ? "bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-200"
              }`}
            >
              <Search className="w-4 h-4" />
              Help Me Explore
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "quick" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-2xl mx-auto"
          >
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium mb-3">
                <Zap className="w-4 h-4" />
                Quick Quote
              </div>
            </div>
            
            <Card className="shadow-lg border-0 bg-white">
              <CardContent className="p-8">
                <form onSubmit={handleQuickQuoteSubmit} className="space-y-6">
                  <div className="grid gap-6">
                    <div>
                      <Label htmlFor="brand" className="text-sm font-medium text-gray-700 mb-2 block">
                        Preferred Brand
                      </Label>
                      <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                        <SelectTrigger className="h-12 text-base focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                          <SelectValue placeholder="Select brand" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="no-preference">No preference</SelectItem>
                          {brands.map((brand) => (
                            <SelectItem key={brand.id} value={brand.name}>
                              {brand.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="size" className="text-sm font-medium text-gray-700 mb-2 block">
                        Project Size (sq ft)
                      </Label>
                      <Select value={projectSize} onValueChange={setProjectSize}>
                        <SelectTrigger className="h-12 text-base focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent>
                          {projectSizes.map((size) => (
                            <SelectItem key={size.value} value={size.value}>
                              {size.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="postal" className="text-sm font-medium text-gray-700 mb-2 block">
                        Postal Code
                      </Label>
                      <Input
                        id="postal"
                        placeholder="e.g., M5V 3A8"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value.toUpperCase())}
                        maxLength={7}
                        className="h-12 text-base focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                      {postalCode && !validatePostalCode(postalCode) && (
                        <p className="text-sm text-red-600 mt-1">Please enter a valid Canadian postal code</p>
                      )}
                    </div>
                  </div>

                  <div className="text-center pt-4">
                    <Button 
                      type="submit" 
                      size="lg" 
                      disabled={!isFormValid || isLoading}
                      className="px-8 py-4 text-base font-medium bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:opacity-50 transition-all duration-200 transform hover:scale-105 shadow-lg"
                    >
                      {isLoading ? "Getting Your Quote..." : "Get My Competitive Quotes"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTab === "explore" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2">Browse by Flooring Type</h3>
              <p className="text-gray-600">Choose a flooring type to explore available brands</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {flooringTypes.map((type, index) => (
                <motion.div
                  key={type.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Link
                    to={`/browse?category=${encodeURIComponent(type.name.toLowerCase())}`}
                    className="group block"
                  >
                    <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white border-2 hover:border-blue-200">
                      <CardContent className="p-6 text-center relative">
                        <div className="text-4xl mb-4">{type.emoji}</div>
                        <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-600 transition-colors">
                          {type.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">{type.description}</p>
                        {!brandCountsLoading && (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            {brandCounts[type.name] || 0} brands available
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default FlooringPathTabs;
