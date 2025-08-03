
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

// Cache key for localStorage
const BRANDS_CACHE_KEY = 'flooring_brands_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useFlooringData = () => {
  const instanceId = useRef(Math.random().toString(36).substr(2, 9));
  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandsLoading, setBrandsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const startTime = Date.now();
    console.log(`[${instanceId.current}] 🚀 ${new Date().toISOString()} - Starting brand fetch...`);
    
    // Check cache first
    const cached = localStorage.getItem(BRANDS_CACHE_KEY);
    if (cached) {
      try {
        const { data: cachedBrands, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION) {
          console.log(`[${instanceId.current}] 📦 Using cached brands (${cachedBrands.length})`);
          setBrands(cachedBrands);
          setBrandsLoading(false);
          return;
        }
      } catch (e) {
        console.warn(`[${instanceId.current}] ⚠️ Invalid cache data, clearing...`);
        localStorage.removeItem(BRANDS_CACHE_KEY);
      }
    }
    
    // Cancel any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();

    const fetchBrandsWithRetry = async (retryCount = 0) => {
      const maxRetries = 3;
      const retryDelay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
      
      try {
        console.log(`[${instanceId.current}] 📡 ${new Date().toISOString()} - Attempt ${retryCount + 1}/${maxRetries + 1} fetching brands...`);
        
        const { data, error } = await supabase
          .from("flooring_brands")
          .select("id, name")
          .order("name");
        
        if (abortControllerRef.current?.signal.aborted) {
          console.log(`[${instanceId.current}] 🛑 Request was aborted`);
          return;
        }

        const elapsed = Date.now() - startTime;
        console.log(`[${instanceId.current}] ✅ ${new Date().toISOString()} - Query completed in ${elapsed}ms:`, { data, error });
        
        if (error) {
          throw new Error(`Database error: ${error.message}`);
        }
        
        if (!data || data.length === 0) {
          console.warn(`[${instanceId.current}] ⚠️ No brands found in database`);
          setBrands(FALLBACK_BRANDS);
          setError("No brands in database - using fallback brands");
        } else {
          console.log(`[${instanceId.current}] 🎉 Successfully loaded ${data.length} brands`);
          setBrands(data);
          setError(null);
          
          // Cache the successful result
          localStorage.setItem(BRANDS_CACHE_KEY, JSON.stringify({
            data,
            timestamp: Date.now()
          }));
        }
        
        setBrandsLoading(false);
        console.log(`[${instanceId.current}] 🏁 ${new Date().toISOString()} - Set brandsLoading to false`);
        
      } catch (fetchError) {
        if (abortControllerRef.current?.signal.aborted) {
          console.log(`[${instanceId.current}] 🛑 Request was aborted during fetch`);
          return;
        }
        
        console.error(`[${instanceId.current}] 💥 Fetch attempt ${retryCount + 1} failed:`, fetchError);
        
        if (retryCount < maxRetries) {
          console.log(`[${instanceId.current}] 🔄 Retrying in ${retryDelay}ms...`);
          setTimeout(() => {
            if (!abortControllerRef.current?.signal.aborted) {
              fetchBrandsWithRetry(retryCount + 1);
            }
          }, retryDelay);
        } else {
          console.error(`[${instanceId.current}] ❌ All ${maxRetries + 1} attempts failed, using fallback brands`);
          setBrands(FALLBACK_BRANDS);
          setError(`Failed to load brands after ${maxRetries + 1} attempts - using fallback brands`);
          setBrandsLoading(false);
        }
      }
    };

    fetchBrandsWithRetry();

    // Cleanup function
    return () => {
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
