-- Fix leads table RLS policies to prevent public read access to sensitive customer data

-- Drop any policies that might allow public read access
DROP POLICY IF EXISTS "Allow public read access to leads" ON public.leads;
DROP POLICY IF EXISTS "Public can view leads" ON public.leads;
DROP POLICY IF EXISTS "Anyone can view leads" ON public.leads;

-- Ensure leads table has proper RLS policies for data protection
-- Keep only secure policies:

-- 1. Allow public lead submissions (customers can submit quotes)
DROP POLICY IF EXISTS "leads: public insert" ON public.leads;
CREATE POLICY "leads: public insert" 
ON public.leads 
FOR INSERT 
WITH CHECK (
  -- Only allow creation of unverified leads with pending status
  status = 'pending_verification' AND 
  is_verified = false AND
  verification_token IS NOT NULL
);

-- 2. Admin access (full control)
-- (keeping existing admin policies)

-- 3. Retailer access (only distributed leads)  
-- (keeping existing retailer policies)

-- Double-check no public SELECT policies exist
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT schemaname, tablename, policyname, cmd, permissive, roles, qual, with_check
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'leads' 
        AND cmd = 'SELECT'
        AND (roles = '{public}' OR qual LIKE '%true%' OR qual = 'true')
    LOOP
        RAISE NOTICE 'Found potentially insecure SELECT policy: %', r.policyname;
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.leads', r.policyname);
    END LOOP;
END$$;