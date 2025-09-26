import React from "react";
import { motion } from "framer-motion";
import { Users, Award, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const benefits = [
  {
    icon: Users,
    title: "Qualified Leads",
    description: "Receive high-quality leads from homeowners actively seeking flooring solutions."
  },
  {
    icon: Award,
    title: "Trusted Network",
    description: "Join a trusted network of verified retailers serving customers across Canada."
  },
  {
    icon: TrendingUp,
    title: "Grow Your Business",
    description: "Expand your customer base and increase revenue with our lead generation platform."
  }
];

export const PartnerWithSection = () => {
  return (
    <section className="py-16 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Partner With Price My Floor
          </h2>
          <p className="text-lg text-orange-100 max-w-2xl mx-auto">
            Join our network of trusted flooring retailers and grow your business with qualified leads
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                <benefit.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {benefit.title}
              </h3>
              <p className="text-orange-100 leading-relaxed">
                {benefit.description}
              </p>
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
            className="bg-white text-orange-600 hover:bg-orange-50 font-semibold px-8"
            asChild
          >
            <Link to="/retailer/apply">Become a Partner</Link>
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            className="border-white text-white hover:bg-white hover:text-orange-600 font-semibold px-8"
            asChild
          >
            <Link to="/retailer/login">Retailer Login</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};