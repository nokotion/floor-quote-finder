
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Zap, Search, ArrowDown } from "lucide-react";
import { Typewriter } from "@/components/ui/typewriter";

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
  const scrollToForm = () => {
    const formSection = document.querySelector('#flooring-form');
    if (formSection) {
      formSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full bg-muted py-12 md:py-20">
      <div className="container text-center max-w-4xl mx-auto px-4">
        {/* Main Headline with Multi-Line Structure */}
        <div className="text-center text-4xl sm:text-5xl md:text-6xl font-bold leading-tight space-y-3 mb-4">
          <div>Get</div>

          <div className="text-blue-600">
            <Typewriter
              text={adjectives}
              speed={60}
              waitTime={1500}
              deleteSpeed={40}
              className="text-blue-600"
              cursorChar={<span className="text-[0.6em] align-baseline">_</span>}
            />
          </div>

          <div>Flooring Quotes from</div>

          <div className="font-bold text-blue-600">Verified Local Retailers</div>
        </div>

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

        {/* Scroll to Form Button */}
        <motion.div 
          className="flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold px-8 py-4 text-base"
            onClick={scrollToForm}
          >
            <ArrowDown className="w-5 h-5 mr-2" />
            Get Started Below
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
