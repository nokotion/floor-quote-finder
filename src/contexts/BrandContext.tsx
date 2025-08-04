import React, { createContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const BrandContext = createContext();

export const BrandProvider = ({ children }) => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("flooring_brands")
          .select("id, name")
          .order("name");
        if (error) throw error;
        setBrands(data || []);
      } catch (err) {
        console.error("❌ BrandContext error:", err.message);
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
