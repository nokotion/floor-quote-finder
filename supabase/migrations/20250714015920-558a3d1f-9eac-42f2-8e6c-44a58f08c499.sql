-- Clean up all existing INSERT policies for leads table to resolve conflicts
DROP POLICY IF EXISTS "Allow public lead submissions" ON public.leads;
DROP POLICY IF EXISTS "Allow public lead creation" ON public.leads;
DROP POLICY IF EXISTS "Enable public lead submissions" ON public.leads;

-- Create single, clean INSERT policy for public lead creation
CREATE POLICY "Allow public lead creation" 
ON public.leads 
FOR INSERT 
WITH CHECK (
  customer_name IS NOT NULL 
  AND customer_email IS NOT NULL 
  AND postal_code IS NOT NULL 
  AND status = 'pending_verification'
);

-- Ensure RLS is enabled
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;