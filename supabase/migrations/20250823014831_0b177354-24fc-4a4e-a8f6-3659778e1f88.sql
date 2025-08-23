-- Secure leads table by removing public insertion and implementing secure handling

-- Drop overly permissive policies that allow public insertion without proper validation
DROP POLICY IF EXISTS "Allow lead submissions with verification status" ON public.leads;
DROP POLICY IF EXISTS "leads: authenticated insert" ON public.leads;

-- Create secure policy that only allows the service role (edge functions) to insert leads
-- This ensures all lead submissions go through proper validation and security checks
CREATE POLICY "Service role can insert validated leads" 
ON public.leads 
FOR INSERT 
WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Keep existing secure policies for reading:
-- - Admins can view all leads
-- - Retailers can only view distributed leads
-- - Public insertion is now handled through secure edge function only