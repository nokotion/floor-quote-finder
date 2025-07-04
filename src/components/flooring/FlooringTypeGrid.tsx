
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { flooringTypes } from "@/constants/flooringData";

interface FlooringTypeGridProps {
  brandCounts: Record<string, number>;
  brandCountsLoading: boolean;
}

export const FlooringTypeGrid = ({ brandCounts, brandCountsLoading }: FlooringTypeGridProps) => {
  return (
    <div>
      <div className="text-center mb-4">
        <h3 className="text-2xl font-bold mb-2">Browse by Flooring Type</h3>
        <p className="text-gray-600">Choose a flooring type to explore available brands</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
              <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white border-2 hover:border-accent">
                <CardContent className="p-4 text-center relative">
                  <div className="mb-3 flex justify-center">
                    <img 
                      src={type.icon} 
                      alt={`${type.name} flooring icon`}
                      className="w-16 h-16 object-contain"
                    />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-accent transition-colors">
                    {type.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">{type.description}</p>
                  {!brandCountsLoading && (
                    <Badge variant="secondary" className="bg-accent/10 text-accent-foreground">
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
  );
};
