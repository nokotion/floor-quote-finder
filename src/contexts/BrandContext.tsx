import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Brand {
  id: string;
  name: string;
}

interface BrandContextProps {
  brands: Brand[];
  loading: boolean;
  error: string | null;
}

const BrandContext = createContext<BrandContextProps | undefined>(undefined);

export const BrandProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const { data, error } = await supabase.from("flooring_brands").select("id, name").order("name");
        if (error) throw error;
        setBrands(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBrands();
  }, []);

  return (
    <BrandContext.Provider value={{ brands, loading, error }}>
      {children}
    </BrandContext.Provider>
  );
};

export const useBrands = (): BrandContextProps => {
  const context = useContext(BrandContext);
  if (!context) throw new Error("useBrands must be used within BrandProvider");
  return context;
};
