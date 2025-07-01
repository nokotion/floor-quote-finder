
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Shield, Users, Award } from "lucide-react";
import { Link } from "react-router-dom";
import FlooringPathTabs from "@/components/FlooringPathTabs";
import { Hero } from "@/components/ui/animated-hero";

const Index = () => {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="font-bold text-2xl text-blue-600">
              Price My Floor
            </div>
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

      {/* New Animated Hero */}
      <Hero />

      {/* Trust Indicators Section */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.p 
            className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Connect with verified Canadian flooring retailers and get real quotes 
            for your project in minutes, not days.
          </motion.p>

          <motion.div 
            className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              10,000+ Happy Customers
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Verified Retailers
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              Best Price Guarantee
            </div>
          </motion.div>
        </div>
      </section>

      {/* Flooring Path Tabs */}
      <FlooringPathTabs />

      {/* Final CTA */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
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
            <p className="text-xl mb-10 opacity-90">
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
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="font-bold text-2xl text-blue-400 mb-4">Price My Floor</div>
          <p className="text-gray-400 mb-6">
            Connecting Canadian homeowners with trusted flooring professionals since 2024
          </p>
          <div className="flex justify-center items-center gap-8 text-sm text-gray-400">
            <span>© 2024 Price My Floor</span>
            <span>•</span>
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Terms of Service</span>
            <span>•</span>
            <span>Contact Us</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
