
import { useState } from "react";
import { motion } from "framer-motion";
import { useFlooringData } from "@/hooks/useFlooringData";
import { TabSwitcher } from "@/components/flooring/TabSwitcher";
import { QuickQuoteForm } from "@/components/flooring/QuickQuoteForm";
import { FlooringTypeGrid } from "@/components/flooring/FlooringTypeGrid";

const FlooringPathTabs = () => {
  const [activeTab, setActiveTab] = useState("quick"); // Default to "quick" (I Know What I Want)
  const { brands, brandCounts, brandCountsLoading } = useFlooringData();

  return (
    <section className="py-4 px-4 bg-white">
      <div className="max-w-5xl mx-auto">
        <motion.div 
          className="text-center mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl font-bold mb-2">How would you like to get started?</h2>
          <p className="text-gray-600 mb-6">Choose your preferred path to find the perfect flooring</p>
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
            <QuickQuoteForm brands={brands} />
          </motion.div>
        )}

        {activeTab === "explore" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <FlooringTypeGrid brandCounts={brandCounts} brandCountsLoading={brandCountsLoading} />
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default FlooringPathTabs;
