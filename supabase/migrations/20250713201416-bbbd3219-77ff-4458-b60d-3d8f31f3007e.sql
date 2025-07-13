-- Fix RLS policy for leads table to allow public submissions
-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Allow public lead submissions" ON public.leads;

-- Create a new policy that allows public lead creation for pending verification status
CREATE POLICY "Allow public lead creation" 
ON public.leads 
FOR INSERT 
WITH CHECK (
  customer_name IS NOT NULL 
  AND customer_email IS NOT NULL 
  AND postal_code IS NOT NULL 
  AND status = 'pending_verification'
);