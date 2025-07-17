-- Drop existing problematic RLS policy for lead creation
DROP POLICY IF EXISTS "Allow public lead creation" ON public.leads;

-- Create a new policy that explicitly applies to anon and authenticated roles
CREATE POLICY "Allow public lead creation" 
ON public.leads 
FOR INSERT 
TO anon, authenticated
WITH CHECK (
  customer_name IS NOT NULL 
  AND customer_email IS NOT NULL 
  AND postal_code IS NOT NULL 
  AND status = 'pending_verification'
);

-- Ensure RLS is enabled
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;