
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Brand {
  id: string;
  name: string;
}

const FALLBACK_BRANDS = [
  { id: "1", name: "Shaw" },
  { id: "2", name: "Mohawk" },
  { id: "3", name: "Armstrong" },
  { id: "4", name: "Tarkett" },
  { id: "5", name: "Mannington" }
];

export const useFlooringData = () => {
  const instanceId = useRef(Math.random().toString(36).substr(2, 9));
  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandsLoading, setBrandsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log(`[${instanceId.current}] 🚀 Starting brand fetch...`);
    
    const fetchBrands = async () => {
      try {
        setBrandsLoading(true);
        setError(null);
        
        console.log(`[${instanceId.current}] 📡 Querying flooring_brands table...`);
        
        // Simple, direct query
        const { data, error, status, statusText } = await supabase
          .from("flooring_brands")
          .select("id, name")
          .order("name");

        console.log(`[${instanceId.current}] 📊 Query completed:`, { 
          status, 
          statusText,
          dataLength: data?.length || 0,
          error: error ? `${error.code}: ${error.message}` : null,
          sampleData: data?.slice(0, 3)
        });
        
        if (error) {
          console.error(`[${instanceId.current}] ❌ Supabase error:`, error);
          throw new Error(`Database error: ${error.message}`);
        }
        
        if (!data || data.length === 0) {
          console.warn(`[${instanceId.current}] ⚠️ No brands found, using fallback`);
          setBrands(FALLBACK_BRANDS);
          setError("No brands found in database, showing defaults");
        } else {
          console.log(`[${instanceId.current}] ✅ Loaded ${data.length} brands successfully`);
          setBrands(data);
          setError(null);
        }
        
      } catch (fetchError) {
        console.error(`[${instanceId.current}] 💥 Fetch failed:`, fetchError);
        setError(fetchError instanceof Error ? fetchError.message : 'Unknown error');
        setBrands(FALLBACK_BRANDS);
      } finally {
        setBrandsLoading(false);
      }
    };

    // Execute immediately without timeout
    fetchBrands();
  }, []);

  console.log(`[${instanceId.current}] 🎯 Current state:`, { 
    brandsCount: brands.length, 
    brandsLoading, 
    hasError: !!error,
    firstBrand: brands[0]?.name
  });
  
  return { brands, brandsLoading, error };
};
