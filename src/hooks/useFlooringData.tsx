
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

export const useFlooringData = () => {
  const instanceId = useRef(Math.random().toString(36).substr(2, 9));
  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandsLoading, setBrandsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const startTime = Date.now();
    console.log(`[${instanceId.current}] 🚀 ${new Date().toISOString()} - Starting brand fetch...`);
    
    // Cancel any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log(`[${instanceId.current}] ⏰ ${new Date().toISOString()} - 5 second timeout reached, using fallback brands`);
      setBrands(FALLBACK_BRANDS);
      setBrandsLoading(false);
      setError("Query timeout - using fallback brands");
    }, 5000);

    const fetchBrands = async () => {
      try {
        console.log(`[${instanceId.current}] 📡 ${new Date().toISOString()} - Fetching brands from database...`);
        
        const { data, error } = await supabase
          .from("flooring_brands")
          .select("id, name")
          .order("name");
        
        // Clear timeout if query completes
        clearTimeout(timeoutId);
        
        if (abortControllerRef.current?.signal.aborted) {
          console.log(`[${instanceId.current}] 🛑 Request was aborted`);
          return;
        }

        const elapsed = Date.now() - startTime;
        console.log(`[${instanceId.current}] ✅ ${new Date().toISOString()} - Query completed in ${elapsed}ms:`, { data, error });
        
        if (error) {
          console.error(`[${instanceId.current}] ❌ Database error:`, error);
          setBrands(FALLBACK_BRANDS);
          setError(`Database error: ${error.message}`);
        } else if (!data || data.length === 0) {
          console.warn(`[${instanceId.current}] ⚠️ No brands found in database`);
          setBrands(FALLBACK_BRANDS);
          setError("No brands in database - using fallback brands");
        } else {
          console.log(`[${instanceId.current}] 🎉 Successfully loaded ${data.length} brands`);
          setBrands(data);
          setError(null);
        }
        
        setBrandsLoading(false);
        console.log(`[${instanceId.current}] 🏁 ${new Date().toISOString()} - Set brandsLoading to false`);
        
      } catch (fetchError) {
        clearTimeout(timeoutId);
        
        if (abortControllerRef.current?.signal.aborted) {
          console.log(`[${instanceId.current}] 🛑 Request was aborted during fetch`);
          return;
        }
        
        console.error(`[${instanceId.current}] 💥 Fetch exception:`, fetchError);
        setBrands(FALLBACK_BRANDS);
        setError(`Fetch failed: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`);
        setBrandsLoading(false);
      }
    };

    fetchBrands();

    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  console.log(`[${instanceId.current}] 🎯 Returning state:`, { 
    brandsCount: brands.length, 
    brandsLoading, 
    hasError: !!error,
    timestamp: new Date().toISOString()
  });
  
  return { brands, brandsLoading, error };
};
