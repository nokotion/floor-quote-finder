
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { flooringTypes } from "@/constants/flooringData";

// Create a clean anonymous client for public data queries
const anonClient = createClient(
  "https://syjxtyvsencbmhuprnyu.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5anh0eXZzZW5jYm1odXBybnl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxNzQ4MTQsImV4cCI6MjA2NTc1MDgxNH0.0MchabnLmc3rnXzHnKeTYJO-gTDV3MzYNQQOl3ARCnc"
);

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
      
      const { data, error } = await anonClient
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
        
        // Simple brand counts calculation
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
      
      setBrandCountsLoading(false);
    };

    fetchData().catch(error => {
      console.error('💥 fetchData error:', error);
      setBrands([]);
      setBrandCounts({});
      setBrandCountsLoading(false);
    });
  }, []);

  console.log('🎯 Hook returning:', { brandsLength: brands.length, brandCountsLoading });
  return { brands, brandCounts, brandCountsLoading };
};
