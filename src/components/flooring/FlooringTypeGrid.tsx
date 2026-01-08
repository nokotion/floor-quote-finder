import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { flooringTypes } from "@/constants/flooringData";
import { useIsMobile } from "@/hooks/use-mobile";
import { GlassCard } from "@/components/ui/glass-card";
import { ArrowRight } from "lucide-react";

interface FlooringTypeGridProps {
  brandCounts: Record<string, number>;
  brandCountsLoading: boolean;
}

export const FlooringTypeGrid = ({ brandCounts, brandCountsLoading }: FlooringTypeGridProps) => {
  const isMobile = useIsMobile();

  return (
    <div>
      <div className="text-center mb-6">
        <h3 className={`font-bold mb-2 text-gradient ${isMobile ? 'text-xl' : 'text-2xl'}`}>
          Browse by Flooring Type
        </h3>
        <p className={`text-muted-foreground ${isMobile ? 'text-sm' : ''}`}>
          Choose a flooring type to explore available brands
        </p>
      </div>
      
      <div className={`grid gap-4 ${isMobile ? 'grid-cols-2 gap-3' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4'}`}>
        {flooringTypes.map((type, index) => (
          <motion.div
            key={type.name}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
          >
            <Link
              to={`/browse?category=${encodeURIComponent(type.name.toLowerCase())}`}
              className="group block h-full"
            >
              <GlassCard 
                variant="default" 
                className="h-full hover-lift overflow-hidden relative"
              >
                {/* Hover gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 to-rose-500/0 group-hover:from-orange-500/5 group-hover:to-rose-500/10 transition-all duration-500" />
                
                <div className={`text-center relative ${isMobile ? 'p-3' : 'p-4'}`}>
                  {/* Image with enhanced styling */}
                  <div className={`flex justify-center ${isMobile ? 'mb-2' : 'mb-3'}`}>
                    <motion.div 
                      className="aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 p-2 shadow-inner"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <img 
                        src={type.icon} 
                        alt={`${type.name} flooring icon`}
                        className="object-cover w-full h-full rounded-lg"
                      />
                    </motion.div>
                  </div>
                  
                  {/* Title with arrow on hover */}
                  <h3 className={`font-semibold text-foreground group-hover:text-gradient-accent transition-all duration-300 flex items-center justify-center gap-1 ${isMobile ? 'text-sm mb-1' : 'text-base mb-2'}`}>
                    {type.name}
                    <ArrowRight className="w-0 h-4 group-hover:w-4 transition-all duration-300 opacity-0 group-hover:opacity-100" />
                  </h3>
                  
                  {/* Description */}
                  {!isMobile && (
                    <p className="text-xs text-muted-foreground mb-2 leading-tight line-clamp-2">
                      {type.description}
                    </p>
                  )}
                  
                  {/* Brand count badge */}
                  {!brandCountsLoading && (
                    <Badge 
                      variant="secondary" 
                      className="text-xs px-3 py-1 bg-gradient-to-r from-orange-100 to-rose-100 text-orange-700 border-0"
                    >
                      {brandCounts[type.name] || 0} brands
                    </Badge>
                  )}
                </div>
              </GlassCard>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
