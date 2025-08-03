import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Brand {
  id: string;
  name: string;
}

interface BrandContextType {
  brands: Brand[];
  loading: boolean;
  refetch: () => Promise<void>;
  error: string | null;
}

const BrandContext = createContext<BrandContextType | undefined>(undefined);

export const BrandProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBrands = async () => {
    console.log("🎯 BrandContext: Starting brand fetch...");
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.from("flooring_brands").select("id, name").order("name");
      
      console.log("📊 BrandContext: Query result:", { data: data?.length, error });
      
      if (error) {
        console.error("❌ BrandContext: Supabase error:", error);
        setError(error.message);
        setBrands([]);
      } else if (data && data.length > 0) {
        console.log("✅ BrandContext: Successfully loaded", data.length, "brands");
        setBrands(data);
        setError(null);
      } else {
        console.warn("⚠️ BrandContext: No brands found in database");
        setBrands([]);
        setError("No brands found");
      }
    } catch (err) {
      console.error("💥 BrandContext: Unexpected error:", err);
      setError("Failed to load brands");
      setBrands([]);
    } finally {
      setLoading(false);
      console.log("🏁 BrandContext: Fetch complete");
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  return (
    <BrandContext.Provider value={{ brands, loading, refetch: fetchBrands, error }}>
      {children}
    </BrandContext.Provider>
  );
};

export const useBrands = (): BrandContextType => {
  const context = useContext(BrandContext);
  if (!context) throw new Error("useBrands must be used within a BrandProvider");
  return context;
};