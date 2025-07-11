-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Allow public lead submissions" ON public.leads;

-- Create new policy with explicit role targeting for anon and authenticated users
CREATE POLICY "Enable public lead submissions" ON public.leads
  FOR INSERT 
  TO anon, authenticated
  WITH CHECK (true);

-- Ensure RLS is enabled
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;