-- Check the current RLS policy for leads table
-- Drop existing policy if it exists and recreate with better conditions
DROP POLICY IF EXISTS "Enable public lead submissions" ON public.leads;

-- Create new policy for public lead submissions with explicit conditions
CREATE POLICY "Allow public lead submissions" ON public.leads
  FOR INSERT 
  TO anon, authenticated
  WITH CHECK (
    customer_name IS NOT NULL 
    AND customer_email IS NOT NULL 
    AND postal_code IS NOT NULL
    AND status = 'pending_verification'
  );