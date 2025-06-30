
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft } from "lucide-react";

interface FlooringExplorerProps {
  onBack: () => void;
}

const FlooringExplorer = ({ onBack }: FlooringExplorerProps) => {
  const [brandCounts, setBrandCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const flooringTypes = [
    { name: "Tile", emoji: "🔲", description: "Ceramic, porcelain, and natural stone" },
    { name: "Vinyl", emoji: "📱", description: "Luxury vinyl plank and sheet vinyl" },
    { name: "Hardwood", emoji: "🪵", description: "Solid and engineered hardwood floors" },
    { name: "Laminate", emoji: "✨", description: "Durable and affordable wood-look floors" },
    { name: "Carpet", emoji: "🏠", description: "Soft and comfortable floor coverings" }
  ];

  useEffect(() => {
    const fetchBrandCounts = async () => {
      try {
        const { data, error } = await supabase
          .from('flooring_brands')
          .select('categories');
        
        if (error) throw error;

        const counts: Record<string, number> = {};
        flooringTypes.forEach(type => {
          counts[type.name] = data?.filter(brand => 
            brand.categories?.toLowerCase().includes(type.name.toLowerCase())
          ).length || 0;
        });

        setBrandCounts(counts);
      } catch (error) {
        console.error('Error fetching brand counts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBrandCounts();
  }, []);

  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="mb-6 hover:bg-gray-100"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Options
          </Button>
          <h2 className="text-3xl font-bold mb-4">Browse by Flooring Type</h2>
          <p className="text-xl text-gray-600">Choose a flooring type to explore available brands</p>
        </motion.div>
        
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
                    {!loading && (
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
      </div>
    </section>
  );
};

export default FlooringExplorer;
