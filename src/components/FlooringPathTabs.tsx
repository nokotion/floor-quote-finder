
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const navigate = useNavigate();

  const flooringTypes = [
    { name: "Tile", emoji: "🔲", description: "Ceramic, porcelain, and natural stone" },
    { name: "Vinyl", emoji: "📱", description: "Luxury vinyl plank and sheet vinyl" },
    { name: "Hardwood", emoji: "🪵", description: "Solid and engineered hardwood floors" },
    { name: "Laminate", emoji: "✨", description: "Durable and affordable wood-look floors" },
    { name: "Carpet", emoji: "🏠", description: "Soft and comfortable floor coverings" }
  ];

  const projectSizes = [
    { value: "100-500", label: "100-500 sq ft" },
    { value: "500-1000", label: "500-1,000 sq ft" },
    { value: "1000-2000", label: "1,000-2,000 sq ft" },
    { value: "2000+", label: "2,000+ sq ft" }
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

    setIsLoading(true);
    
    const params = new URLSearchParams({
      brand: selectedBrand,
      size: projectSize,
      postal: postalCode.toUpperCase()
    });

    navigate(`/quote?${params.toString()}`);
  };

  const isFormValid = selectedBrand && projectSize && postalCode;

  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold mb-4">How would you like to get started?</h2>
          <p className="text-xl text-gray-600">Choose your preferred path to find the perfect flooring</p>
        </motion.div>

        <Tabs defaultValue="quick" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-gray-100 p-1 h-14">
            <TabsTrigger 
              value="quick" 
              className="flex items-center gap-2 text-base font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white"
            >
              <Zap className="w-5 h-5" />
              I Know What I Want
            </TabsTrigger>
            <TabsTrigger 
              value="explore" 
              className="flex items-center gap-2 text-base font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-gray-500 data-[state=active]:to-gray-600 data-[state=active]:text-white"
            >
              <Search className="w-5 h-5" />
              Help Me Explore
            </TabsTrigger>
          </TabsList>

          <TabsContent value="quick" className="mt-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
                <CardHeader>
                  <CardTitle className="text-center text-2xl flex items-center justify-center gap-2">
                    <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-medium">
                      <Zap className="w-4 h-4" />
                      Quick Quote
                    </div>
                  </CardTitle>
                  <p className="text-center text-gray-600">Tell us about your project and we'll connect you with the right retailers</p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleQuickQuoteSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-3 gap-6">
                      <div>
                        <Label htmlFor="brand">Preferred Brand</Label>
                        <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                          <SelectTrigger>
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
                        <Label htmlFor="size">Project Size</Label>
                        <Select value={projectSize} onValueChange={setProjectSize}>
                          <SelectTrigger>
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
                        <Label htmlFor="postal">Postal Code</Label>
                        <Input
                          id="postal"
                          placeholder="e.g., L4Y"
                          value={postalCode}
                          onChange={(e) => setPostalCode(e.target.value.toUpperCase())}
                          maxLength={3}
                          pattern="[A-Z][0-9][A-Z]"
                        />
                      </div>
                    </div>

                    <div className="text-center">
                      <Button 
                        type="submit" 
                        size="lg" 
                        disabled={!isFormValid || isLoading}
                        className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:opacity-50"
                      >
                        {isLoading ? "Getting Your Quote..." : "Get My Competitive Quotes"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="explore" className="mt-0">
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
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default FlooringPathTabs;
