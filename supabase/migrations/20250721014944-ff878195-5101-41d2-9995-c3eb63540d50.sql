
-- Fix the RLS policy issue that's causing permission errors
-- Remove the problematic policy that references auth.users directly
DROP POLICY IF EXISTS "Retailers can update their own profiles" ON public.retailers;

-- Keep only the profile-based policies that work correctly
-- The existing "Retailers can update their own data" policy should handle updates properly
