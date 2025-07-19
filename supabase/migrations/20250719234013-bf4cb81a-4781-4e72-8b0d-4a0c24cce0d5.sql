
-- Drop the existing restrictive policy that's causing issues
DROP POLICY IF EXISTS "Universal lead insertion policy" ON public.leads;

-- Create a more permissive policy for public lead submissions
-- This allows anyone (including anonymous users) to insert leads with basic validation
CREATE POLICY "Allow public lead submissions"
ON public.leads
FOR INSERT
WITH CHECK (
  -- Basic field validation - ensure required fields are not null or empty
  customer_name IS NOT NULL AND 
  customer_name != '' AND
  customer_email IS NOT NULL AND 
  customer_email != '' AND
  postal_code IS NOT NULL AND 
  postal_code != ''
);
