-- Fix RLS policy to allow both anonymous and authenticated users to submit leads
-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Allow public lead creation" ON public.leads;

-- Create updated policy that allows both public (anonymous) and authenticated users
CREATE POLICY "Allow public lead creation" 
ON public.leads 
FOR INSERT 
TO public, authenticated
WITH CHECK (
  customer_name IS NOT NULL 
  AND customer_email IS NOT NULL 
  AND postal_code IS NOT NULL 
  AND status = 'pending_verification'
);