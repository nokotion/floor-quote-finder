import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Brand {
  id: string;
  name: string;
}

interface BrandContextType {
  brands: Brand[];
  loading: boolean;
  refetch?: () => Promise<void>;
}

const BrandContext = createContext<BrandContextType | undefined>(undefined);

export const BrandProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBrands = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("flooring_brands").select("id, name").order("name");
    if (!error && data) setBrands(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  return (
    <BrandContext.Provider value={{ brands, loading, refetch: fetchBrands }}>
      {children}
    </BrandContext.Provider>
  );
};

export const useBrands = (): BrandContextType => {
  const context = useContext(BrandContext);
  if (!context) throw new Error("useBrands must be used within a BrandProvider");
  return context;
};