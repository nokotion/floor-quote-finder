
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Brand {
  id: string;
  name: string;
}

// Module-level cache to persist data across component mounts
const cachedBrands = { data: null as Brand[] | null };

export const useFlooringData = () => {
  const instanceId = useRef(`HOOK_${Math.random().toString(36).substr(2, 9)}`);
  const fetchInProgress = useRef(false);
  const [brands, setBrands] = useState<Brand[]>(cachedBrands.data || []);
  const [brandsLoading, setBrandsLoading] = useState(!cachedBrands.data);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log(`[${instanceId.current}] 🎬 HOOK MOUNTED - Starting brand fetch...`);
    
    // Skip fetch if we have cached data
    if (cachedBrands.data) {
      console.log(`[${instanceId.current}] ✅ Using cached brands:`, cachedBrands.data.length);
      setBrands(cachedBrands.data);
      setBrandsLoading(false);
      return;
    }
    
    // Prevent multiple simultaneous fetches
    if (fetchInProgress.current) {
      console.log(`[${instanceId.current}] ⚠️ Fetch already in progress, skipping...`);
      return;
    }
    
    const fetchBrands = async () => {
      fetchInProgress.current = true;
      setBrandsLoading(true);
      setError(null);
      
      console.log(`[${instanceId.current}] 📡 Querying flooring_brands table...`);
      console.log(`[${instanceId.current}] 🔐 Auth state:`, supabase.auth.getUser());
      
      // Raw Supabase query without error handling to see exact failure point
      const response = await supabase
        .from("flooring_brands")
        .select("id, name")
        .order("name");

      // Log raw response before any processing
      console.log(`[${instanceId.current}] 🔍 RAW SUPABASE RESPONSE:`, {
        data: response.data,
        error: response.error,
        status: response.status,
        statusText: response.statusText,
        count: response.count,
        rawResponse: response
      });

      if (response.error) {
        console.error(`[${instanceId.current}] ❌ SUPABASE ERROR DETAILS:`, {
          code: response.error.code,
          message: response.error.message,
          details: response.error.details,
          hint: response.error.hint
        });
        setError(`Database error: ${response.error.message}`);
        setBrands([]);
        setBrandsLoading(false);
        fetchInProgress.current = false;
        return;
      }
      
      if (!response.data || response.data.length === 0) {
        console.warn(`[${instanceId.current}] ⚠️ No brands found in database`);
        setBrands([]);
        setError("No brands found in database");
        setBrandsLoading(false);
        fetchInProgress.current = false;
        return;
      }

      console.log(`[${instanceId.current}] ✅ Successfully loaded brands:`, response.data.length, response.data.slice(0, 3));
      
      // Cache the successful response
      cachedBrands.data = response.data;
      setBrands(response.data);
      setError(null);
      setBrandsLoading(false);
      fetchInProgress.current = false;
    };

    // Execute immediately
    fetchBrands();
    
    // Cleanup function to track unmounting
    return () => {
      console.log(`[${instanceId.current}] 🧹 HOOK UNMOUNTING - Cleanup`);
      fetchInProgress.current = false;
    };
  }, []);

  console.log(`[${instanceId.current}] 🎯 Current state:`, { 
    brandsCount: brands.length, 
    brandsLoading, 
    hasError: !!error,
    firstBrand: brands[0]?.name
  });
  
  return { brands, brandsLoading, error };
};
