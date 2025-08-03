
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

console.log("🔥 useFlooringData.tsx file loaded");

interface Brand {
  id: string;
  name: string;
}

export const useFlooringData = () => {
  console.log("🎬 useFlooringData hook mounting...");
  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandsLoading, setBrandsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("🚀 Starting brand fetch...");
    const fetchBrands = async () => {
      setBrandsLoading(true);
      console.log("🔄 Set brandsLoading to true");
      
      try {
        console.log("📡 Testing Supabase connection...");
        
        // First test basic connection
        const { data: testData, error: testError } = await supabase
          .from("flooring_brands")
          .select("count", { count: "exact", head: true });
        
        console.log("🧪 Connection test result:", { testData, testError, count: testData });
        
        if (testError) {
          console.error("❌ Connection test failed:", testError);
          // Try with a fallback of hardcoded brands for now
          console.log("🔄 Using fallback brands...");
          const fallbackBrands = [
            { id: "1", name: "Shaw" },
            { id: "2", name: "Mohawk" },
            { id: "3", name: "Armstrong" },
            { id: "4", name: "Tarkett" },
            { id: "5", name: "Mannington" }
          ];
          setBrands(fallbackBrands);
          setError("Using fallback brands - database connection issue");
          console.log("✅ Fallback brands set:", fallbackBrands.length);
        } else {
          console.log("✅ Connection successful, fetching actual brands...");
          
          const { data, error } = await supabase
            .from("flooring_brands")
            .select("id, name")
            .order("name");
          
          console.log("🚀 Supabase brand fetch result:", { data, error });
          console.log("🔍 Data type:", typeof data, "Array?", Array.isArray(data));
          console.log("🔍 Error details:", error?.message, error?.details, error?.hint);
          
          if (error) {
            console.error("❌ Brand fetch error:", error);
            setError(`Database error: ${error.message}`);
          } else if (!data || data.length === 0) {
            console.warn("⚠️ No brands found, adding sample data...");
            // If no data exists, we'll use fallback brands
            const fallbackBrands = [
              { id: "1", name: "Shaw" },
              { id: "2", name: "Mohawk" },
              { id: "3", name: "Armstrong" },
              { id: "4", name: "Tarkett" },
              { id: "5", name: "Mannington" }
            ];
            setBrands(fallbackBrands);
            setError("No brands in database - using sample brands");
          } else {
            console.log("✅ Setting brands data:", data.length, "brands");
            console.log("🔍 First 3 brands:", data.slice(0, 3));
            setBrands(data);
            setError(null);
          }
        }
      } catch (fetchError) {
        console.error("💥 Fetch exception:", fetchError);
        console.error("💥 Exception details:", {
          message: fetchError instanceof Error ? fetchError.message : 'Unknown error',
          stack: fetchError instanceof Error ? fetchError.stack : 'No stack'
        });
        
        // Use fallback brands on any error
        const fallbackBrands = [
          { id: "1", name: "Shaw" },
          { id: "2", name: "Mohawk" },
          { id: "3", name: "Armstrong" },
          { id: "4", name: "Tarkett" },
          { id: "5", name: "Mannington" }
        ];
        setBrands(fallbackBrands);
        setError(`Fetch failed: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'} - using fallback brands`);
      } finally {
        console.log("🏁 Setting brandsLoading to false");
        setBrandsLoading(false);
        console.log("🏁 Final state - brandsLoading: false");
      }
    };

    fetchBrands();
  }, []);

  console.log("🎯 useFlooringData returning:", { brandsCount: brands.length, brandsLoading, hasError: !!error });
  
  return { brands, brandsLoading, error };
};
