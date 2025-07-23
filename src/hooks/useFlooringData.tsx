
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { createClient } from '@supabase/supabase-js';
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
        
        // Create a dedicated public client to ensure anonymous access
        const publicClient = createClient(
          "https://syjxtyvsencbmhuprnyu.supabase.co",
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5anh0eXZzZW5jYm1odXBybnl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxNzQ4MTQsImV4cCI6MjA2NTc1MDgxNH0.0MchabnLmc3rnXzHnKeTYJO-gTDV3MzYNQQOl3ARCnc",
          {
            auth: {
              persistSession: false,
              autoRefreshToken: false,
            }
          }
        );
        
        // Test 1: Try with the public client first
        console.log('🧪 Test 1: Using dedicated public client');
        let { data: brandsData, error: brandsError } = await publicClient
          .from('flooring_brands')
          .select('id, name, categories')
          .order('name');
        
        // Test 2: If that fails, try with the regular client
        if (brandsError || !brandsData?.length) {
          console.log('🧪 Test 2: Fallback to regular client');
          const result = await supabase
            .from('flooring_brands')
            .select('id, name, categories')
            .order('name');
          brandsData = result.data;
          brandsError = result.error;
        }
        
        console.log('📊 BRANDS FETCHED:', brandsData?.length || 0, 'brands');
        console.log('🔍 Raw data:', brandsData);
        console.log('❌ ERROR (if any):', brandsError);
        
        if (brandsError) {
          console.error('💥 Error fetching brands:', brandsError);
          console.error('💥 Error details:', brandsError.message, brandsError.details, brandsError.hint);
          throw brandsError;
        }
        
        if (!brandsData || brandsData.length === 0) {
          console.warn('⚠️ No brands found in database');
          setBrands([]);
          setBrandCounts({});
          return;
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
        console.error('💥 Error stack:', error);
        // Set empty state on error
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
