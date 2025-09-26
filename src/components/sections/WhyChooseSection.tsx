import React from "react";
import { motion } from "framer-motion";
import { Clock, CheckCircle, TrendingUp, Star } from "lucide-react";

const features = [
  {
    icon: Clock,
    title: "Fast & Easy",
    description: "Get quotes from multiple retailers in minutes, not days. Our streamlined process saves you time."
  },
  {
    icon: CheckCircle,
    title: "Verified Retailers",
    description: "All our partner retailers are thoroughly vetted and verified for quality and reliability."
  },
  {
    icon: TrendingUp,
    title: "Best Prices",
    description: "Compare competitive quotes to ensure you get the best value for your flooring project."
  },
  {
    icon: Star,
    title: "Quality Service",
    description: "Exceptional customer service and professional installation from trusted local experts."
  }
];

export const WhyChooseSection = () => {
  return (
    <section className="py-8 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Choose Price My Floor?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We make finding the perfect flooring simple, affordable, and stress-free
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center group"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                <feature.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};