
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link to="/" className="flex items-center">
              <img 
                src="https://syjxtyvsencbmhuprnyu.supabase.co/storage/v1/object/public/pricemyfloor-files//pricemyfloor%20_logo.png" 
                alt="Price My Floor Logo" 
                className="h-16 md:h-20 lg:h-24 w-auto"
                style={{ maxHeight: '72px' }}
              />
            </Link>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <Shield className="w-3 h-3 mr-1" />
                Verified Retailers Only
              </Badge>
              <Button variant="outline" asChild>
                <Link to="/browse">Browse</Link>
              </Button>
              <Button asChild>
                <Link to="/quote">Get Quote</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

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
              <div className="text-2xl md:text-3xl lg:text-4xl text-blue-600 my-2">
                <Typewriter 
                  text={["Competitive", "Local", "Amazing", "Quality", "Trusted"]}
                  className="text-blue-600"
                  speed={60}
                  waitTime={1500}
                  deleteSpeed={40}
                />
              </div>
              <div>Flooring Quotes from</div>
              <div className="text-blue-600">Verified Local Retailers</div>
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
      <section className="py-12 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
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
              <Button size="lg" className="text-lg px-8 py-4 bg-white text-blue-600 hover:bg-gray-100" asChild>
                <Link to="/quote">Start My Quote</Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-blue-600" asChild>
                <Link to="/browse">Browse Retailers</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer7 />
    </div>
  );
};

export default Index;
