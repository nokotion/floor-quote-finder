import React from "react";
import { motion } from "framer-motion";
import { Clock, CheckCircle, TrendingUp, Star } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";

const features = [
  {
    icon: Clock,
    title: "Fast & Easy",
    description: "Get quotes from multiple retailers in minutes, not days.",
    gradient: "from-blue-500 to-cyan-500",
    size: "normal"
  },
  {
    icon: CheckCircle,
    title: "Verified Retailers",
    description: "All retailers are vetted for quality and reliability.",
    gradient: "from-green-500 to-emerald-500",
    size: "normal"
  },
  {
    icon: TrendingUp,
    title: "Best Prices",
    description: "Compare competitive quotes for the best value.",
    gradient: "from-orange-500 to-rose-500",
    size: "normal"
  },
  {
    icon: Star,
    title: "Quality Service",
    description: "Professional installation from trusted local experts.",
    gradient: "from-purple-500 to-pink-500",
    size: "normal"
  }
];

export const WhyChooseSection = () => {
  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50/50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-100/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-rose-100/30 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-gradient">Why Choose</span>{" "}
            <span className="text-gradient-accent">Price My Floor?</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We make finding the perfect flooring simple, affordable, and stress-free
          </p>
        </motion.div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <GlassCard 
                variant="default" 
                className="h-full p-6 group hover-lift cursor-pointer"
              >
                <div className="text-center">
                  {/* Icon with gradient background */}
                  <motion.div 
                    className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-lg`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <feature.icon className="w-8 h-8 text-white" />
                  </motion.div>
                  
                  <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-gradient-accent transition-all duration-300">
                    {feature.title}
                  </h3>
                  
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
