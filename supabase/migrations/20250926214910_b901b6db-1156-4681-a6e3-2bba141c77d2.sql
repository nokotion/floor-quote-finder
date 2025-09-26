-- Fix RLS policy for retailer applications to allow public submissions
-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Authenticated users can insert applications" ON public.retailer_applications;

-- Create new policy allowing public submissions
CREATE POLICY "Public can submit retailer applications" 
ON public.retailer_applications 
FOR INSERT 
WITH CHECK (true);

-- Ensure the table has RLS enabled
ALTER TABLE public.retailer_applications ENABLE ROW LEVEL SECURITY;