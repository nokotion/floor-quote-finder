
import { useState, useRef, useEffect, memo } from "react";
import { motion } from "framer-motion";
import { useBrands } from "@/contexts/BrandContext";
import { TabSwitcher } from "@/components/flooring/TabSwitcher";
import QuickQuoteForm from "@/components/flooring/QuickQuoteForm";
import { FlooringTypeGrid } from "@/components/flooring/FlooringTypeGrid";
import { ContainerTextFlip } from "@/components/ui/container-text-flip";

const FlooringPathTabs = memo(() => {
  const componentId = useRef(`TABS_${Math.random().toString(36).substr(2, 9)}`);
  const renderCount = useRef(0);
  renderCount.current++;
  
  console.log(`[${componentId.current}] 🎬 FlooringPathTabs rendering... (render #${renderCount.current})`);
  
  const [activeTab, setActiveTab] = useState("quick");
  const { brands, loading, error } = useBrands();
  
  // Track re-renders
  useEffect(() => {
    console.log(`[${componentId.current}] 🔄 FlooringPathTabs useEffect triggered`);
  });
  
  // Track component lifecycle
  useEffect(() => {
    console.log(`[${componentId.current}] 🎬 FlooringPathTabs MOUNTED`);
    return () => {
      console.log(`[${componentId.current}] 🧹 FlooringPathTabs UNMOUNTING`);
    };
  }, []);
  
  console.log(`[${componentId.current}] 📤 Passing brands to QuickQuoteForm:`, brands?.length, "Loading:", loading, "Error:", error);

  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent leading-tight">
            Get{' '}
            <ContainerTextFlip 
              words={["Competitive", "Quality", "Affordable", "Trusted", "Local"]} 
              className="bg-transparent shadow-none border-none"
              textClassName="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent"
              interval={2500}
            />
            {' '}Flooring Quotes from Verified Retailers
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Compare prices, quality, and service from trusted flooring stores across Canada
          </p>
          
          {/* Statistics */}
          <motion.div 
            className="flex flex-col sm:flex-row justify-center items-center gap-8 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                <ContainerTextFlip 
                  words={["2 Min", "Fast", "Quick", "Easy"]} 
                  className="bg-transparent shadow-none border-none"
                  textClassName="text-3xl font-bold text-primary"
                  interval={3000}
                />
              </div>
              <div className="text-sm text-muted-foreground">Average Quote Time</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">500+</div>
              <div className="text-sm text-muted-foreground">Verified Retailers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">98%</div>
              <div className="text-sm text-muted-foreground">Customer Satisfaction</div>
            </div>
          </motion.div>
        </motion.div>

        {/* Enhanced Connected Tab Switcher - Bigger and More Prominent */}
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
            <FlooringTypeGrid brandCounts={{}} brandCountsLoading={loading} />
          </motion.div>
        )}
      </div>
    </section>
  );
});

FlooringPathTabs.displayName = 'FlooringPathTabs';

export default FlooringPathTabs;
