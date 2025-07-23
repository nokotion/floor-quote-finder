
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
      setBrandCountsLoading(true);
      try {
        console.log('🔄 Fetching brands from database...');
        
        // Ensure we're using anonymous access for public data
        const { data: brandsData, error: brandsError } = await supabase
          .from('flooring_brands')
          .select('id, name, categories')
          .order('name');
        
        console.log('📊 BRANDS FETCHED:', brandsData?.length || 0, 'brands');
        console.log('🔍 Raw data sample:', brandsData?.slice(0, 3));
        
        if (brandsError) {
          console.error('💥 Error fetching brands:', brandsError);
          console.error('💥 Error details:', JSON.stringify(brandsError, null, 2));
          throw brandsError;
        }
        
        if (!brandsData || brandsData.length === 0) {
          console.warn('⚠️ No brands found in database');
          setBrands([]);
          setBrandCounts({});
          return;
        }
        
        console.log('✅ Setting brands state with', brandsData.length, 'brands');
        setBrands(brandsData);

        // Calculate brand counts with better error handling for categories
        const counts: Record<string, number> = {};
        flooringTypes.forEach(type => {
          counts[type.name] = brandsData?.filter(brand => {
            if (!brand.categories) return false;
            
            // Handle both string and array formats for categories
            let categoryString = '';
            if (Array.isArray(brand.categories)) {
              categoryString = brand.categories.join(',').toLowerCase();
            } else {
              categoryString = String(brand.categories).toLowerCase();
            }
            
            return categoryString.includes(type.name.toLowerCase());
          }).length || 0;
        });
        console.log('📈 Brand counts calculated:', counts);
        setBrandCounts(counts);
      } catch (error) {
        console.error('💥 Error in fetchData:', error);
        console.error('💥 Full error object:', JSON.stringify(error, null, 2));
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
