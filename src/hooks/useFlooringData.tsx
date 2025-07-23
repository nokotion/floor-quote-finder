
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
    const fetchData = async () => {
      try {
        const { data, error } = await supabase
          .from('flooring_brands')
          .select('id, name, categories');
        
        if (error) {
          setError(`Database error: ${error.message}`);
          setBrandCountsLoading(false);
          return;
        }
        
        if (data) {
          setBrands(data);
          
          // Calculate brand counts for each flooring type
          const counts: Record<string, number> = {};
          flooringTypes.forEach(type => {
            counts[type.name] = data.filter(brand => {
              const categories = brand.categories || '';
              return categories.toLowerCase().includes(type.name.toLowerCase());
            }).length;
          });
          
          setBrandCounts(counts);
        }
      } catch (fetchError) {
        setError(`Fetch failed: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`);
      }
      
      setBrandCountsLoading(false);
    };

    fetchData();
  }, []);
  
  return { brands, brandCounts, brandCountsLoading, error };
};
