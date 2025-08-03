

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
        console.log("📡 Making Supabase query...");
        const { data, error } = await supabase
          .from("flooring_brands")
          .select("id, name")
          .order("name");
        
        console.log("🚀 Supabase raw result:", { data, error });
        console.log("🔍 Data type:", typeof data, "Array?", Array.isArray(data));
        console.log("🔍 Error details:", error?.message, error?.details, error?.hint);
        
        if (error) {
          console.error("❌ Supabase fetch error:", error);
          setError(`Database error: ${error.message}`);
        } else if (!data) {
          console.warn("⚠️ No data received from Supabase");
          setError("No data received from database");
        } else if (Array.isArray(data) && data.length === 0) {
          console.warn("⚠️ Data is empty array");
          setBrands([]);
          setError("No brands found in database");
        } else if (data) {
          console.log("✅ Setting brands data:", data.length, "brands");
          console.log("🔍 First 3 brands:", data.slice(0, 3));
          setBrands(data);
          setError(null);
          console.log("✅ useFlooringData fetched brands:", data?.length, data?.slice(0,3));
        }
      } catch (fetchError) {
        console.error("💥 Fetch exception:", fetchError);
        console.error("💥 Exception stack:", fetchError instanceof Error ? fetchError.stack : 'No stack');
        setError(`Fetch failed: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`);
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

