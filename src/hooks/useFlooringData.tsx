
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
    console.log('🚀 useFlooringData hook mounted, starting fetch...');
    
    const fetchBrands = async () => {
      try {
        console.log('📡 Making Supabase query to flooring_brands...');
        const { data, error } = await supabase
          .from('flooring_brands')
          .select('id, name')
          .order('name');
        
        console.log("✅ useFlooringData fetched brands:", data?.length || 0, "brands");
        
        if (error) {
          console.error('❌ Supabase error:', error);
          setError(`Database error: ${error.message}`);
        } else if (data) {
          console.log('🔍 First 3 brands:', data.slice(0, 3));
          setBrands(data);
        } else {
          console.warn('⚠️ No data received from Supabase');
        }
      } catch (fetchError) {
        console.error('💥 Fetch exception:', fetchError);
        setError(`Fetch failed: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`);
      } finally {
        console.log('🏁 Setting brandsLoading to false');
        setBrandsLoading(false);
      }
    };

    fetchBrands();
  }, []);

  console.log('🎯 Hook returning state:', { 
    brandsLength: brands.length, 
    brandsLoading, 
    error,
    firstBrandName: brands[0]?.name
  });
  
  return { brands, brandsLoading, error };
};
