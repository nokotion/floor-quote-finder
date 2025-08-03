
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Brand {
  id: string;
  name: string;
}

// FALLBACK_BRANDS removed completely to surface real issues

export const useFlooringData = () => {
  const instanceId = useRef(`HOOK_${Math.random().toString(36).substr(2, 9)}`);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandsLoading, setBrandsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log(`[${instanceId.current}] 🚀 Starting brand fetch...`);
    
    const fetchBrands = async () => {
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
        setBrands([]); // No fallback, force empty to see the real issue
        setBrandsLoading(false);
        return;
      }
      
      if (!response.data || response.data.length === 0) {
        console.warn(`[${instanceId.current}] ⚠️ No brands found in database`);
        setBrands([]);
        setError("No brands found in database");
        setBrandsLoading(false);
        return;
      }

      console.log(`[${instanceId.current}] ✅ Successfully loaded brands:`, response.data.length, response.data.slice(0, 3));
      setBrands(response.data);
      setError(null);
      setBrandsLoading(false);
    };

    // Execute immediately
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
