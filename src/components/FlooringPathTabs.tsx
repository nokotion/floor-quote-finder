import { useState, useRef, useEffect, memo, useMemo } from "react";
import { motion } from "framer-motion";
import { useBrands } from "@/contexts/BrandContext";
import { TabSwitcher } from "@/components/flooring/TabSwitcher";
import QuickQuoteForm from "@/components/flooring/QuickQuoteForm";
import { FlooringTypeGrid } from "@/components/flooring/FlooringTypeGrid";
import { ContainerTextFlip } from "@/components/ui/container-text-flip";
import { AnimatedGradientBackground } from "@/components/ui/animated-gradient-background";
import { FloatingShapes } from "@/components/ui/floating-shapes";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { GlassCard } from "@/components/ui/glass-card";

const FlooringPathTabs = memo(() => {
  const componentId = useRef(`TABS_${Math.random().toString(36).substr(2, 9)}`);
  const renderCount = useRef(0);
  renderCount.current++;
  console.log(`[${componentId.current}] 🎬 FlooringPathTabs rendering... (render #${renderCount.current})`);
  const [activeTab, setActiveTab] = useState("quick");
  const {
    brands,
    loading,
    error
  } = useBrands();

  // Calculate brand counts by category
  const brandCounts = useMemo(() => {
    if (!brands || brands.length === 0) return {};
    const counts: Record<string, number> = {
      "Tile": 0,
      "Vinyl": 0,
      "Hardwood": 0,
      "Laminate": 0,
      "Carpet": 0,
      "Sports": 0
    };
    brands.forEach(brand => {
      if (!brand.categories) return;
      let categoryString = '';
      if (typeof brand.categories === 'string') {
        categoryString = brand.categories;
      } else if (Array.isArray(brand.categories)) {
        categoryString = brand.categories.join(',');
      }

      const categoryArray = categoryString.replace(/[{}]/g, '').split(',').map(c => c.trim()).filter(c => c.length > 0).map(c => c.toLowerCase());

      categoryArray.forEach(cat => {
        const normalized = cat.charAt(0).toUpperCase() + cat.slice(1);
        if (counts[normalized] !== undefined) {
          counts[normalized]++;
        }
      });
    });
    console.log(`[${componentId.current}] 📊 Brand counts calculated:`, counts);
    return counts;
  }, [brands]);

  useEffect(() => {
    console.log(`[${componentId.current}] 🔄 FlooringPathTabs useEffect triggered`);
  });

  useEffect(() => {
    console.log(`[${componentId.current}] 🎬 FlooringPathTabs MOUNTED`);
    return () => {
      console.log(`[${componentId.current}] 🧹 FlooringPathTabs UNMOUNTING`);
    };
  }, []);

  console.log(`[${componentId.current}] 📤 Passing brands to QuickQuoteForm:`, brands?.length, "Loading:", loading, "Error:", error);

  return (
    <section className="relative py-12 px-4 min-h-[80vh]">
      {/* Animated Background */}
      <AnimatedGradientBackground />
      <FloatingShapes />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Hero Section */}
        <motion.div 
          className="text-center mb-6" 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.h1 
            className="text-4xl lg:text-6xl font-bold mb-4 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <div className="flex flex-col items-center gap-1 py-2">
              <span className="text-gradient">Get</span>
              <ContainerTextFlip 
                words={["Competitive", "Quality", "Affordable", "Trusted", "Local"]} 
                className="bg-transparent" 
                textClassName="text-4xl lg:text-6xl font-bold text-gradient-accent" 
                interval={2500} 
                minWidth={320} 
              />
              <span className="text-gradient">Flooring Quotes from</span>
              <span className="text-gradient-accent">Verified Retailers</span>
            </div>
          </motion.h1>

          <motion.p 
            className="text-lg lg:text-xl text-muted-foreground mb-6 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Compare prices, quality, and service from trusted flooring stores across Canada
          </motion.p>
          
          {/* Statistics with Glass Cards */}
          <motion.div 
            className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <GlassCard variant="subtle" className="px-6 py-3 hover-lift">
              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-bold text-gradient-accent">
                  <ContainerTextFlip 
                    words={["2 Min", "Fast", "Quick", "Easy"]} 
                    className="bg-transparent shadow-none border-none" 
                    textClassName="text-2xl lg:text-3xl font-bold text-gradient-accent" 
                    interval={3000} 
                  />
                </div>
                <div className="text-xs text-muted-foreground mt-1">Average Quote Time</div>
              </div>
            </GlassCard>

            <GlassCard variant="subtle" className="px-6 py-3 hover-lift">
              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-bold text-gradient-accent py-[11px]">
                  <AnimatedCounter value={500} suffix="+" />
                </div>
                <div className="text-xs text-muted-foreground mt-1">Verified Retailers</div>
              </div>
            </GlassCard>

            <GlassCard variant="subtle" className="px-6 py-3 hover-lift">
              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-bold text-gradient-accent py-[11px]">
                  <AnimatedCounter value={98} suffix="%" />
                </div>
                <div className="text-xs text-muted-foreground mt-1">Customer Satisfaction</div>
              </div>
            </GlassCard>
          </motion.div>
        </motion.div>

        {/* Tab Switcher */}
        <TabSwitcher activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Tab Content */}
        {activeTab === "quick" && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <QuickQuoteForm brands={brands} brandsLoading={loading} />
          </motion.div>
        )}

        {activeTab === "explore" && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <FlooringTypeGrid brandCounts={brandCounts} brandCountsLoading={loading} />
          </motion.div>
        )}
      </div>
    </section>
  );
});

FlooringPathTabs.displayName = 'FlooringPathTabs';
export default FlooringPathTabs;
