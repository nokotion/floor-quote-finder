
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Brand {
  id: string;
  name: string;
}

export const useFlooringData = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandsLoading, setBrandsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const { data, error } = await supabase
          .from("flooring_brands")
          .select("id, name")
          .order("name");
        
        console.log("🚀 useFlooringData fetched brands:", data, error);
        
        if (error) {
          console.error("❌ Supabase error:", error);
          setError(`Database error: ${error.message}`);
        } else if (data) {
          setBrands(data);
        }
      } catch (fetchError) {
        console.error("💥 Fetch exception:", fetchError);
        setError(`Fetch failed: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`);
      } finally {
        setBrandsLoading(false);
      }
    };

    fetchBrands();
  }, []);
  
  return { brands, brandsLoading, error };
};
