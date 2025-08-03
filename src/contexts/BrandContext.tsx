import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const BrandContext = createContext(null);

export const BrandProvider = ({ children }) => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBrands = async () => {
      const { data } = await supabase.from("flooring_brands").select("id, name").order("name");
      setBrands(data || []);
      setLoading(false);
    };
    fetchBrands();
  }, []);

  return (
    <BrandContext.Provider value={{ brands, loading }}>
      {children}
    </BrandContext.Provider>
  );
};

export const useBrands = () => useContext(BrandContext);