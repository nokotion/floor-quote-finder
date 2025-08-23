-- Fix retailer_applications table RLS to prevent unauthorized data harvesting

-- Drop the overly permissive policy that allows anyone to insert applications
DROP POLICY IF EXISTS "Anyone can insert applications" ON public.retailer_applications;

-- Create secure policy requiring authentication for application submission
CREATE POLICY "Authenticated users can insert applications" 
ON public.retailer_applications 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Keep existing secure policies:
-- - "Admins can view all applications" (admin access)
-- - "Admins can update applications" (admin management)