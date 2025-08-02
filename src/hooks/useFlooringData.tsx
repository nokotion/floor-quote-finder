
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { flooringTypes } from "@/constants/flooringData";

interface Brand {
  id: string;
  name: string;
}

export const useFlooringData = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandCounts, setBrandCounts] = useState<Record<string, number>>({});
  const [brandCountsLoading, setBrandCountsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🚀 useFlooringData hook mounted, starting fetch...');
    
    const fetchData = async () => {
      try {
        console.log('📡 Making Supabase query to flooring_brands...');
        const { data, error } = await supabase
          .from('flooring_brands')
          .select('id, name, categories')
          .order('name');
        
        console.log("useFlooringData fetched brands:", data, error);
        
        if (error) {
          console.error('❌ Supabase error:', error);
          setError(`Database error: ${error.message}`);
          setBrandCountsLoading(false);
          return;
        }
        
        if (data) {
          console.log('✅ Successfully fetched', data.length, 'brands');
          console.log('🔍 First 3 brands:', data.slice(0, 3));
          setBrands(data);
          
          // Calculate brand counts for each flooring type
          const counts: Record<string, number> = {};
          flooringTypes.forEach(type => {
            counts[type.name] = data.filter(brand => {
              const categories = brand.categories || '';
              return categories.toLowerCase().includes(type.name.toLowerCase());
            }).length;
          });
          
          console.log('📈 Brand counts calculated:', counts);
          setBrandCounts(counts);
        } else {
          console.warn('⚠️ No data received from Supabase');
        }
      } catch (fetchError) {
        console.error('💥 Fetch exception:', fetchError);
        setError(`Fetch failed: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`);
      }
      
      console.log('🏁 Setting brandCountsLoading to false');
      setBrandCountsLoading(false);
    };

    fetchData();
  }, []);

  console.log('🎯 Hook returning state:', { 
    brandsLength: brands.length, 
    brandCountsLoading, 
    error,
    firstBrandName: brands[0]?.name
  });
  
  return { brands, brandCounts, brandCountsLoading, error };
};
