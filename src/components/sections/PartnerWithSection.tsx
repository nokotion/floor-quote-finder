import React from "react";
import { motion } from "framer-motion";
import { Users, Award, TrendingUp, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const benefits = [
  {
    icon: Users,
    title: "Qualified Leads",
    description: "Receive high-quality leads from homeowners actively seeking flooring solutions.",
    gradient: "from-white/20 to-white/10"
  },
  {
    icon: Award,
    title: "Trusted Network",
    description: "Join a trusted network of verified retailers serving customers across Canada.",
    gradient: "from-white/25 to-white/15"
  },
  {
    icon: TrendingUp,
    title: "Grow Your Business",
    description: "Expand your customer base and increase revenue with our lead generation platform.",
    gradient: "from-white/20 to-white/10"
  }
];

export const PartnerWithSection = () => {
  return (
    <section className="py-16 relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-rose-500 to-red-500" />
      
      {/* Floating decorative elements */}
      <motion.div
        className="absolute top-20 left-10 w-32 h-32 rounded-full bg-white/10 blur-2xl"
        animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl"
        animate={{ y: [0, 20, 0], x: [0, -10, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">
            Partner With Price My Floor
          </h2>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Join our network of trusted flooring retailers and grow your business with qualified leads
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-5xl mx-auto">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className={`h-full p-6 rounded-2xl bg-gradient-to-br ${benefit.gradient} backdrop-blur-sm border border-white/20 hover:border-white/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/10`}>
                <div className="text-center">
                  <motion.div 
                    className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <benefit.icon className="w-8 h-8 text-white" />
                  </motion.div>
                  <h3 className="text-xl font-semibold mb-2 text-white">
                    {benefit.title}
                  </h3>
                  <p className="text-white/80 leading-relaxed text-sm">
                    {benefit.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center"
        >
          <Button 
            size="lg" 
            variant="secondary"
            className="bg-white text-orange-600 hover:bg-white/90 font-semibold px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group"
            asChild
          >
            <Link to="/retailer/apply">
              Become a Partner
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            className="border-2 border-white text-white hover:bg-white hover:text-orange-600 font-semibold px-8 py-6 text-lg rounded-xl transition-all duration-300"
            asChild
          >
            <Link to="/retailer/login">Retailer Login</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};
