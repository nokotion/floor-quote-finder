
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Zap, Search } from "lucide-react";

const adjectives = [
  "Trusted",
  "Affordable", 
  "Local",
  "Competitive",
  "Quality",
];

interface HeroProps {
  onPathSelect: (path: 'quick' | 'explore') => void;
}

export function Hero({ onPathSelect }: HeroProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % adjectives.length);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full bg-muted py-12 md:py-20">
      <div className="container text-center max-w-4xl mx-auto px-4">
        {/* Main Headline with Animation */}
        <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-4">
          Get{" "}
          <span className="relative inline-block h-[1em] w-44 md:w-56 overflow-hidden align-baseline">
            {adjectives.map((word, i) => (
              <motion.span
                key={word}
                className="absolute left-0 top-0 w-full font-bold text-blue-600 text-left whitespace-nowrap"
                initial={{ y: "100%", opacity: 0 }}
                animate={
                  i === index
                    ? { y: "0%", opacity: 1 }
                    : { y: "100%", opacity: 0 }
                }
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                {word}
              </motion.span>
            ))}
          </span>{" "}
          Flooring Quotes from{" "}
          <br />
          <span className="font-bold">Verified Local Retailers</span>
        </h1>

        {/* Subheadline */}
        <motion.p 
          className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          Compare price, quality, and service from trusted flooring stores across Canada.
        </motion.p>

        {/* Trust Badges */}
        <motion.div 
          className="flex flex-wrap justify-center items-center gap-6 md:gap-8 text-sm text-gray-600 mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
            <span className="text-lg">⏱️</span>
            <span className="font-medium">2 Min</span>
          </div>
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
            <span className="text-lg">🏬</span>
            <span className="font-medium">500+ Retailers</span>
          </div>
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
            <span className="text-lg">⭐</span>
            <span className="font-medium">98% Satisfaction</span>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div 
          className="flex flex-col sm:flex-row justify-center gap-4 max-w-lg mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <Button 
            size="lg" 
            className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold px-6 py-4 text-base"
            onClick={() => onPathSelect('quick')}
          >
            <Zap className="w-5 h-5 mr-2" />
            I Know What I Want
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            className="flex-1 border-2 border-gray-300 hover:bg-gray-50 font-semibold px-6 py-4 text-base"
            onClick={() => onPathSelect('explore')}
          >
            <Search className="w-5 h-5 mr-2" />
            Help Me Explore
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
