import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Brand {
  id: string;
  name: string;
}

interface BrandContextType {
  brands: Brand[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const BrandContext = createContext<BrandContextType | undefined>(undefined);

// Cache key for localStorage
const BRANDS_CACHE_KEY = "flooring_brands_cache";
const CACHE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

export const BrandProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load from cache first
  const loadFromCache = (): Brand[] | null => {
    try {
      const cached = localStorage.getItem(BRANDS_CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_EXPIRY_MS) {
          console.log("🔄 BrandContext: Loading from cache");
          return data;
        }
      }
    } catch (err) {
      console.warn("⚠️ BrandContext: Cache read error:", err);
    }
    return null;
  };

  // Save to cache
  const saveToCache = (data: Brand[]) => {
    try {
      localStorage.setItem(BRANDS_CACHE_KEY, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    } catch (err) {
      console.warn("⚠️ BrandContext: Cache save error:", err);
    }
  };

  // Network connectivity test
  const testConnectivity = async (): Promise<boolean> => {
    try {
      const { error } = await supabase.from("flooring_brands").select("id").limit(1);
      return !error;
    } catch {
      return false;
    }
  };

  const fetchBrands = async (retryCount = 0): Promise<void> => {
    console.log(`🔄 BrandContext: Starting brand fetch (attempt ${retryCount + 1})...`);
    setLoading(true);
    setError(null);

    // Try cache first on initial load
    if (retryCount === 0) {
      const cachedBrands = loadFromCache();
      if (cachedBrands && cachedBrands.length > 0) {
        setBrands(cachedBrands);
        setLoading(false);
        console.log("✅ BrandContext: Loaded from cache");
        return;
      }
    }

    try {
      // Test connectivity first
      const isConnected = await testConnectivity();
      if (!isConnected) {
        throw new Error("Unable to connect to database");
      }

      // Progressive timeout based on retry count
      const timeout = Math.min(5000 + (retryCount * 2000), 15000);
      const fetchPromise = supabase
  .from("flooring_brands")
  .select("id, name")
  .order("name")
  .throwOnError(); // ensures any RLS error is visible in console
console.log("🔍 Fetching brands with public access...");      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Fetch timeout after ${timeout/1000} seconds`)), timeout)
      );

      const { data, error } = (await Promise.race([fetchPromise, timeoutPromise])) as any;

      console.log("ℹ️ BrandContext: Query result:", { count: data?.length, error });

      if (error) {
        console.error("❌ BrandContext: Supabase error:", error);
        setError(error.message);
        setBrands([]);
      } else if (data && data.length > 0) {
        console.log("✅ BrandContext: Successfully loaded", data.length, "brands");
        setBrands(data);
        saveToCache(data);
        setError(null);
      } else {
        console.warn("⚠️ BrandContext: No brands found in database");
        setBrands([]);
        setError(null); // No retry button in this case
      }
    } catch (err) {
      console.error(`❗ BrandContext: Unexpected error (attempt ${retryCount + 1}):`, err);
      const errorMessage = err instanceof Error ? err.message : "Failed to load brands";
      
      // Retry with exponential backoff (max 3 attempts)
      if (retryCount < 2) {
        const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
        console.log(`🔄 BrandContext: Retrying in ${delay}ms...`);
        setTimeout(() => fetchBrands(retryCount + 1), delay);
        return;
      }
      
      setError(errorMessage);
      setBrands([]);
    } finally {
      setLoading(false);
      console.log("✅ BrandContext: Fetch complete");
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  return (
    <BrandContext.Provider value={{ brands, loading, error, refetch: () => fetchBrands(0) }}>
      {children}
    </BrandContext.Provider>
  );
};

export const useBrands = (): BrandContextType => {
  const context = useContext(BrandContext);
  if (!context) throw new Error("useBrands must be used within a BrandProvider");
  return context;
};