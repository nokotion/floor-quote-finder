
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

const FALLBACK_BRANDS = [
  { id: "1", name: "Shaw" },
  { id: "2", name: "Mohawk" },
  { id: "3", name: "Armstrong" },
  { id: "4", name: "Tarkett" },
  { id: "5", name: "Mannington" }
];

interface Brand {
  id: string;
  name: string;
}

// Clear any existing cache to force fresh data
const BRANDS_CACHE_KEY = 'flooring_brands_cache';
localStorage.removeItem(BRANDS_CACHE_KEY);

export const useFlooringData = () => {
  const instanceId = useRef(Math.random().toString(36).substr(2, 9));
  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandsLoading, setBrandsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log(`[${instanceId.current}] 🚀 Starting simple brand fetch...`);
    
    const fetchBrands = async () => {
      try {
        console.log(`[${instanceId.current}] 📡 Making direct Supabase query...`);
        
        // Simple, direct query without any complex logic
        const { data, error } = await supabase
          .from("flooring_brands")
          .select("id, name")
          .order("name");

        console.log(`[${instanceId.current}] 📊 Raw Supabase response:`, { 
          data: data?.length ? `${data.length} brands` : data, 
          error: error ? `${error.code}: ${error.message}` : null
        });
        
        if (error) {
          console.error(`[${instanceId.current}] ❌ Supabase error:`, error);
          setError(`Database error: ${error.message}`);
          setBrands(FALLBACK_BRANDS);
        } else if (!data || data.length === 0) {
          console.warn(`[${instanceId.current}] ⚠️ No brands found in database`);
          setError("No brands found in database");
          setBrands(FALLBACK_BRANDS);
        } else {
          console.log(`[${instanceId.current}] ✅ Successfully loaded ${data.length} brands:`, data.map(b => b.name).slice(0, 5));
          setBrands(data);
          setError(null);
        }
        
        setBrandsLoading(false);
        
      } catch (fetchError) {
        console.error(`[${instanceId.current}] 💥 Fetch failed:`, fetchError);
        setError(`Network error: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`);
        setBrands(FALLBACK_BRANDS);
        setBrandsLoading(false);
      }
    };

    fetchBrands();
  }, []);

  console.log(`[${instanceId.current}] 🎯 Returning state:`, { 
    brandsCount: brands.length, 
    brandsLoading, 
    hasError: !!error,
    timestamp: new Date().toISOString()
  });
  
  return { brands, brandsLoading, error };
};
