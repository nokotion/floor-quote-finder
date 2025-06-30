
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ChevronRight, Shield, Users, Award } from "lucide-react";
import { Link } from "react-router-dom";

const words = ["affordable", "beautiful", "quality", "trusted", "local"];

const Index = () => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % words.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

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

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.div {...fadeInUp}>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Find your{" "}
              <motion.span
                key={currentWordIndex}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.5 }}
                className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"
              >
                {words[currentWordIndex]}
              </motion.span>
              <br />
              floor today
            </h1>
          </motion.div>
          
          <motion.p 
            className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Connect with verified Canadian flooring retailers and get real quotes 
            for your project in minutes, not days.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row justify-center gap-4 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <Button size="lg" className="text-lg px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" asChild>
              <Link to="/browse" className="inline-flex items-center">
                Browse by Floor Type <ChevronRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-4 border-2" asChild>
              <Link to="/quote">Get a Quote</Link>
            </Button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div 
            className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
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

        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4">How Price My Floor Works</h2>
            <p className="text-xl text-gray-600">Three simple steps to your perfect floor</p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Tell us about your project",
                description: "Share your flooring needs, upload photos, and specify your requirements",
                icon: "📝",
                color: "from-blue-500 to-cyan-500"
              },
              {
                step: "2", 
                title: "We match you with retailers",
                description: "Our system connects you with verified local retailers who specialize in your flooring type",
                icon: "🤝",
                color: "from-purple-500 to-pink-500"
              },
              {
                step: "3",
                title: "Compare and choose",
                description: "Review quotes, compare prices and services, then choose the best retailer for your project",
                icon: "✅",
                color: "from-green-500 to-teal-500"
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <Card className="relative h-full hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50">
                  <CardContent className="p-8 text-center">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${item.color} text-white text-2xl font-bold mb-6`}>
                      {item.step}
                    </div>
                    <div className="text-4xl mb-4">{item.icon}</div>
                    <h3 className="text-xl font-semibold mb-4">{item.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{item.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Flooring Categories */}
      <section className="py-20 px-4 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4">Browse by Flooring Type</h2>
            <p className="text-xl text-gray-600">Find the perfect flooring solution for your space</p>
          </motion.div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: "Hardwood", emoji: "🪵", popular: true },
              { name: "Tile", emoji: "🔲", popular: false },
              { name: "Vinyl", emoji: "📱", popular: true },
              { name: "Carpet", emoji: "🏠", popular: false },
              { name: "Laminate", emoji: "✨", popular: false },
              { name: "Engineered Wood", emoji: "🌳", popular: true },
              { name: "Luxury Vinyl", emoji: "💎", popular: false },
              { name: "Stone", emoji: "🗿", popular: false }
            ].map((type, index) => (
              <motion.div
                key={type.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Link
                  to={`/browse?category=${encodeURIComponent(type.name.toLowerCase())}`}
                  className="group block relative"
                >
                  <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white border-2 hover:border-blue-200">
                    <CardContent className="p-6 text-center relative">
                      {type.popular && (
                        <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-400 to-red-400 text-white">
                          Popular
                        </Badge>
                      )}
                      <div className="text-4xl mb-4">{type.emoji}</div>
                      <h3 className="text-lg font-semibold group-hover:text-blue-600 transition-colors">
                        {type.name}
                      </h3>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

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
                <Link to="/quote" className="inline-flex items-center">
                  Start My Quote <ChevronRight className="ml-2 w-5 h-5" />
                </Link>
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
