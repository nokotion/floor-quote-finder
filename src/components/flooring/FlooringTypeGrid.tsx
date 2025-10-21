
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { flooringTypes } from "@/constants/flooringData";
import { useIsMobile } from "@/hooks/use-mobile";

interface FlooringTypeGridProps {
  brandCounts: Record<string, number>;
  brandCountsLoading: boolean;
}

export const FlooringTypeGrid = ({ brandCounts, brandCountsLoading }: FlooringTypeGridProps) => {
  const isMobile = useIsMobile();

  return (
    <div>
      <div className="text-center mb-4">
        <h3 className={`font-bold mb-2 ${isMobile ? 'text-xl' : 'text-2xl'}`}>Browse by Flooring Type</h3>
        <p className={`text-gray-600 ${isMobile ? 'text-sm' : ''}`}>Choose a flooring type to explore available brands</p>
      </div>
      
      <div className={`grid gap-2 ${isMobile ? 'grid-cols-2 gap-3' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2'}`}>
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
                <CardContent className={`text-center relative ${isMobile ? 'p-3' : 'p-3'}`}>
                  <div className={`flex justify-center ${isMobile ? 'mb-2' : 'mb-2'}`}>
                    <div className="aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 p-1.5">
                      <img 
                        src={type.icon} 
                        alt={`${type.name} flooring icon`}
                        className="object-cover w-full h-full rounded"
                      />
                    </div>
                  </div>
                  <h3 className={`font-semibold group-hover:text-accent transition-colors ${isMobile ? 'text-sm mb-1' : 'text-sm mb-1'}`}>
                    {type.name}
                  </h3>
                  {!isMobile && (
                    <p className="text-xs text-muted-foreground mb-1.5 leading-tight">{type.description}</p>
                  )}
                  {!brandCountsLoading && (
                    <Badge variant="secondary" className="text-xs px-2 py-0.5">
                      {brandCounts[type.name] || 0} brands
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
