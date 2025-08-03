
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

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
        const { data, error } = await supabase
          .from("flooring_brands")
          .select("id, name")
          .order("name");
        
        console.log("🚀 Supabase raw result:", { data, error });
        
        if (error) {
          console.error("❌ Supabase fetch error:", error);
          setError(`Database error: ${error.message}`);
        } else if (!data) {
          console.warn("⚠️ No data received from Supabase");
        } else if (Array.isArray(data) && data.length === 0) {
          console.warn("⚠️ Data is empty array");
        } else if (data) {
          setBrands(data);
          console.log("✅ useFlooringData fetched brands:", data?.length, data?.slice(0,3));
        }
      } catch (fetchError) {
        console.error("💥 Fetch exception:", fetchError);
        setError(`Fetch failed: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`);
      } finally {
        console.log("🏁 Setting brandsLoading to false");
        setBrandsLoading(false);
      }
    };

    fetchBrands();
  }, []);
  
  return { brands, brandsLoading, error };
};
