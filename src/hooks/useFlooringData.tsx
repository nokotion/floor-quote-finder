
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

  useEffect(() => {
    console.log('🚀 useFlooringData hook mounted, starting fetch...');
    
    const fetchData = async () => {
      console.log('🔄 Fetching brands from database...');
      
      try {
        const { data, error } = await supabase
          .from('flooring_brands')
          .select('id, name, categories');
        
        console.log('📊 Query result:', { data: data?.length, error });
        
        if (error) {
          console.error('❌ Supabase error:', error);
          setBrands([]);
          setBrandCounts({});
          setBrandCountsLoading(false);
          return;
        }
        
        if (data && data.length > 0) {
          console.log('✅ Successfully fetched', data.length, 'brands');
          console.log('🔍 First brand:', data[0]);
          setBrands(data);
          
          // Calculate brand counts for each flooring type
          const counts: Record<string, number> = {};
          flooringTypes.forEach(type => {
            counts[type.name] = data.filter(brand => {
              const categories = brand.categories || '';
              return categories.toLowerCase().includes(type.name.toLowerCase());
            }).length;
          });
          
          console.log('📈 Brand counts:', counts);
          setBrandCounts(counts);
        } else {
          console.warn('⚠️ No brands returned from query');
          setBrands([]);
          setBrandCounts({});
        }
      } catch (fetchError) {
        console.error('💥 Fetch exception:', fetchError);
        setBrands([]);
        setBrandCounts({});
      }
      
      setBrandCountsLoading(false);
    };

    fetchData();
  }, []);

  console.log('🎯 Hook returning:', { brandsLength: brands.length, brandCountsLoading });
  return { brands, brandCounts, brandCountsLoading };
};
