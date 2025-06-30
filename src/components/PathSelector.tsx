
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Zap, Search } from "lucide-react";

interface PathSelectorProps {
  onPathSelect: (path: 'quick' | 'explore') => void;
}

const PathSelector = ({ onPathSelect }: PathSelectorProps) => {
  return (
    <section className="py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold mb-4">How would you like to get started?</h2>
          <p className="text-xl text-gray-600">Choose your preferred path to find the perfect flooring</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer border-2 hover:border-orange-200" 
                  onClick={() => onPathSelect('quick')}>
              <CardContent className="p-8 text-center h-full flex flex-col justify-between">
                <div>
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white mb-6">
                    <Zap className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-800">I Know What I Want</h3>
                  <p className="text-gray-600 mb-6">
                    You already know your preferred brand, project size, and location. 
                    Get competitive quotes fast with our 3-field form.
                  </p>
                </div>
                <Button 
                  size="lg" 
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPathSelect('quick');
                  }}
                >
                  Get My Competitive Quotes
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer border-2 hover:border-gray-200" 
                  onClick={() => onPathSelect('explore')}>
              <CardContent className="p-8 text-center h-full flex flex-col justify-between">
                <div>
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-gray-500 to-gray-600 text-white mb-6">
                    <Search className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-800">Help Me Explore</h3>
                  <p className="text-gray-600 mb-6">
                    Browse by flooring type to discover brands and options. 
                    Perfect for exploring different materials and styles.
                  </p>
                </div>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="w-full border-2 border-gray-300 hover:bg-gray-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPathSelect('explore');
                  }}
                >
                  Browse Flooring Types
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default PathSelector;
