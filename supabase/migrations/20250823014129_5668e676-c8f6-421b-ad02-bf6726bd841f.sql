-- Fix retailers table RLS policies to prevent unauthorized access to business data

-- Drop overly permissive policies that allow authenticated users to view all retailer data
DROP POLICY IF EXISTS "Authenticated users can view retailer profiles" ON public.retailers;
DROP POLICY IF EXISTS "Anyone can view retailers" ON public.retailers;
DROP POLICY IF EXISTS "Public can view retailers" ON public.retailers;

-- Ensure retailers can only view their own data
-- Keep existing secure policies:
-- - "Retailers can view their own data" (restricts to own retailer_id via profiles)
-- - "retailers: retailer read own" (restricts to own user_id)
-- - "Admins can manage all retailers" (admin full access)
-- - "retailers: admin all" (admin access via sec.is_admin())

-- Verify no overly permissive SELECT policies exist
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT schemaname, tablename, policyname, cmd, permissive, roles::text, qual, with_check
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'retailers' 
        AND cmd = 'SELECT'
        AND (
          qual = 'true' OR 
          qual LIKE '%true%' OR
          roles LIKE '%anon%' OR 
          roles LIKE '%public%' OR
          (qual NOT LIKE '%auth.uid()%' AND qual NOT LIKE '%sec.is_admin()%' AND qual NOT LIKE '%retailer_id%' AND qual NOT LIKE '%user_id%')
        )
    LOOP
        RAISE NOTICE 'Found potentially insecure SELECT policy on retailers: %', r.policyname;
        -- Don't auto-drop in case of false positives, just log for review
    END LOOP;
END$$;