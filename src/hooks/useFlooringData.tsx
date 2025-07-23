
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
    console.log('🔧 Supabase client initialized');
    
    const fetchData = async () => {
      console.log('🔄 Starting fetch operation...');
      setError(null);
      
      // Add timeout to detect hanging promises
      const timeoutId = setTimeout(() => {
        console.error('⏰ Fetch timeout after 10 seconds - promise never resolved');
        setError('Request timeout - check network connection');
        setBrandCountsLoading(false);
      }, 10000);

      try {
        console.log('📡 Making Supabase query...');
        const startTime = Date.now();
        
        const queryPromise = supabase
          .from('flooring_brands')
          .select('id, name, categories');
        
        console.log('🎯 Query promise created, awaiting response...');
        const { data, error } = await queryPromise;
        
        clearTimeout(timeoutId);
        const duration = Date.now() - startTime;
        console.log(`📊 Query completed in ${duration}ms:`, { 
          dataLength: data?.length, 
          error: error?.message,
          hasData: !!data,
          isArray: Array.isArray(data)
        });
        
        if (error) {
          console.error('❌ Supabase error details:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
          setError(`Database error: ${error.message}`);
          setBrands([]);
          setBrandCounts({});
          setBrandCountsLoading(false);
          return;
        }
        
        if (data && Array.isArray(data)) {
          console.log('✅ Successfully fetched', data.length, 'brands');
          if (data.length > 0) {
            console.log('🔍 Sample brands:', data.slice(0, 3).map(b => ({ id: b.id, name: b.name })));
          }
          
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
          console.warn('⚠️ Unexpected data format:', { data, type: typeof data });
          setBrands([]);
          setBrandCounts({});
        }
      } catch (fetchError) {
        clearTimeout(timeoutId);
        console.error('💥 Fetch exception details:', {
          error: fetchError,
          message: fetchError instanceof Error ? fetchError.message : 'Unknown error',
          stack: fetchError instanceof Error ? fetchError.stack : undefined
        });
        setError(`Fetch failed: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`);
        setBrands([]);
        setBrandCounts({});
      }
      
      setBrandCountsLoading(false);
    };

    fetchData();
  }, []);

  console.log('🎯 Hook returning:', { 
    brandsLength: brands.length, 
    brandCountsLoading, 
    error,
    firstBrand: brands[0]?.name || 'none'
  });
  
  return { brands, brandCounts, brandCountsLoading, error };
};
