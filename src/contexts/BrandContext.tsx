import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Brand {
  id: string;
  name: string;
}

interface BrandContextType {
  brands: Brand[];
  brandsLoading: boolean;
  error: string | null;
  refetchBrands: () => Promise<void>;
}

const BrandContext = createContext<BrandContextType | undefined>(undefined);

interface BrandProviderProps {
  children: ReactNode;
}

export const BrandProvider: React.FC<BrandProviderProps> = ({ children }) => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandsLoading, setBrandsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBrands = async () => {
    try {
      setBrandsLoading(true);
      setError(null);

      console.log('🔄 BrandProvider: Fetching brands from database...');
      
      const { data, error: supabaseError } = await supabase
        .from('flooring_brands')
        .select('id, name')
        .order('name');

      if (supabaseError) {
        console.error('❌ BrandProvider: Supabase error:', supabaseError);
        setError(`Database error: ${supabaseError.message}`);
        setBrands([]);
        return;
      }

      if (!data || data.length === 0) {
        console.warn('⚠️ BrandProvider: No brands found in database');
        setBrands([]);
        setError('No brands found in database');
        return;
      }

      console.log('✅ BrandProvider: Successfully loaded brands:', data.length);
      setBrands(data);
      setError(null);
    } catch (err) {
      console.error('❌ BrandProvider: Unexpected error:', err);
      setError('Unexpected error occurred');
      setBrands([]);
    } finally {
      setBrandsLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const contextValue: BrandContextType = {
    brands,
    brandsLoading,
    error,
    refetchBrands: fetchBrands,
  };

  return (
    <BrandContext.Provider value={contextValue}>
      {children}
    </BrandContext.Provider>
  );
};

export const useBrands = (): BrandContextType => {
  const context = useContext(BrandContext);
  if (context === undefined) {
    throw new Error('useBrands must be used within a BrandProvider');
  }
  return context;
};