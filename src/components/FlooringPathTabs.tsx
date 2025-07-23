
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { createClient } from "@supabase/supabase-js";
import { useFlooringData } from "@/hooks/useFlooringData";
import { TabSwitcher } from "@/components/flooring/TabSwitcher";
import { QuickQuoteForm } from "@/components/flooring/QuickQuoteForm";
import { FlooringTypeGrid } from "@/components/flooring/FlooringTypeGrid";

// Direct fetch test client
const testClient = createClient(
  "https://syjxtyvsencbmhuprnyu.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5anh0eXZzZW5jYm1odXBybnl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxNzQ4MTQsImV4cCI6MjA2NTc1MDgxNH0.0MchabnLmc3rnXzHnKeTYJO-gTDV3MzYNQQOl3ARCnc"
);

const FlooringPathTabs = () => {
  const [activeTab, setActiveTab] = useState("quick"); // Default to "quick" (I Know What I Want)
  const { brands, brandCounts, brandCountsLoading } = useFlooringData();
  const [directFetchBrands, setDirectFetchBrands] = useState<any[]>([]);

  // Direct fetch test - temporary debugging
  useEffect(() => {
    const testDirectFetch = async () => {
      console.log("🧪 DIRECT FETCH TEST - Starting...");
      try {
        const { data, error } = await testClient
          .from('flooring_brands')
          .select('id, name, categories');
        
        console.log("🧪 DIRECT FETCH - Data:", data?.length || 0, "brands");
        console.log("🧪 DIRECT FETCH - Error:", error);
        console.log("🧪 DIRECT FETCH - First brand:", data?.[0]);
        
        if (data) {
          setDirectFetchBrands(data);
        }
      } catch (err) {
        console.error("🧪 DIRECT FETCH - Exception:", err);
      }
    };
    
    testDirectFetch();
  }, []);

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
            <QuickQuoteForm brands={directFetchBrands.length > 0 ? directFetchBrands : brands} />
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
