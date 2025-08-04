
import { useState, useRef, useEffect, memo } from "react";
import { motion } from "framer-motion";
import { useBrands } from "@/contexts/BrandContext";
import { TabSwitcher } from "@/components/flooring/TabSwitcher";
import QuickQuoteForm from "@/components/flooring/QuickQuoteForm";
import { FlooringTypeGrid } from "@/components/flooring/FlooringTypeGrid";

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
    <section className="py-8 px-4">
      <div className="max-w-4xl mx-auto">
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
