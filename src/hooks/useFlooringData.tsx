
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
    const fetchData = async () => {
      try {
        console.log('🔄 Fetching brands from database...');
        
        // Simple, direct query using the main client
        const { data: brandsData, error: brandsError } = await supabase
          .from('flooring_brands')
          .select('id, name, categories')
          .order('name');
        
        console.log('📊 BRANDS FETCHED:', brandsData?.length || 0, 'brands');
        console.log('🔍 Raw data:', brandsData);
        console.log('❌ ERROR (if any):', brandsError);
        
        if (brandsError) {
          console.error('💥 Error fetching brands:', brandsError);
          throw brandsError;
        }
        
        console.log('✅ Setting brands state with', brandsData?.length || 0, 'brands');
        setBrands(brandsData || []);

        // Calculate brand counts
        const counts: Record<string, number> = {};
        flooringTypes.forEach(type => {
          counts[type.name] = brandsData?.filter(brand => 
            brand.categories?.toLowerCase().includes(type.name.toLowerCase())
          ).length || 0;
        });
        console.log('📈 Brand counts calculated:', counts);
        setBrandCounts(counts);
      } catch (error) {
        console.error('💥 Error in fetchData:', error);
        setBrands([]);
        setBrandCounts({});
      } finally {
        setBrandCountsLoading(false);
      }
    };

    fetchData();
  }, []);

  return { brands, brandCounts, brandCountsLoading };
};
