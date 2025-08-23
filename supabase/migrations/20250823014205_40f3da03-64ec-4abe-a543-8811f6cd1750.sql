-- Fix retailers table RLS policies to prevent unauthorized access to business data

-- Drop the overly permissive policy that allows all authenticated users to view retailer profiles
DROP POLICY IF EXISTS "Authenticated users can view retailer profiles" ON public.retailers;

-- Remove any other potentially unsafe policies
DROP POLICY IF EXISTS "Anyone can view retailers" ON public.retailers;
DROP POLICY IF EXISTS "Public can view retailers" ON public.retailers;

-- The remaining secure policies will ensure:
-- 1. Retailers can only view their own data via "Retailers can view their own data" policy
-- 2. Retailers can only view their own data via "retailers: retailer read own" policy  
-- 3. Admins have full access via "Admins can manage all retailers" policy
-- 4. Admins have full access via "retailers: admin all" policy