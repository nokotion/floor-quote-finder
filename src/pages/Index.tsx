
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Shield, Users, Award } from "lucide-react";
import { Link } from "react-router-dom";
import FlooringPathTabs from "@/components/FlooringPathTabs";
import { Footer7 } from "@/components/ui/footer-7";
import { Typewriter } from "@/components/ui/typewriter";

const Index = () => {
  return (
    <>

      {/* Enhanced Hero Section with Restructured Headline */}
      <section className="py-2 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4">
              <div>Get</div>
              <div className="text-4xl md:text-5xl lg:text-6xl font-bold text-accent my-2">
                <Typewriter 
                  text={["Competitive", "Local", "Amazing", "Quality", "Trusted"]}
                  className="text-accent font-bold"
                  speed={60}
                  waitTime={1500}
                  deleteSpeed={40}
                  cursorChar="|"
                />
              </div>
              <div>Flooring Quotes from</div>
              <div className="bg-gradient-to-r from-yellow-300 to-yellow-600 bg-clip-text text-transparent">Verified Local Retailers</div>
            </div>
            <p className="text-lg text-gray-600 mb-4 max-w-2xl mx-auto">
              Compare price, quality, and service from trusted flooring stores across Canada.
            </p>
            
            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full">
                <span className="text-lg">⏱️</span>
                <span className="font-medium">2 Min</span>
              </div>
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full">
                <span className="text-lg">🏬</span>
                <span className="font-medium">500+ Retailers</span>
              </div>
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full">
                <span className="text-lg">⭐</span>
                <span className="font-medium">98% Satisfaction</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Quote Form - Immediately Visible */}
      <FlooringPathTabs />

      {/* Final CTA */}
      <section className="py-12 px-4 bg-gradient-to-r from-orange-600 to-red-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to transform your space?
            </h2>
            <p className="text-xl mb-6 opacity-90">
              Join thousands of satisfied customers who found their perfect flooring through Price My Floor
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" className="text-lg px-8 py-4 bg-white text-orange-600 hover:bg-gray-100" asChild>
                <Link to="/quote">Start My Quote</Link>
              </Button>
              <Button size="lg" className="text-lg px-8 py-4 bg-white/20 hover:bg-white/30 text-white border-2 border-white/50 backdrop-blur-sm" asChild>
                <Link to="/browse">Browse Brands</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer7 />
    </>
  );
};

export default Index;
