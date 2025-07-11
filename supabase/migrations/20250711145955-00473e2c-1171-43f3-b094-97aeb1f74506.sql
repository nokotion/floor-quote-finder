-- Add policy to allow public users to insert leads
CREATE POLICY "Allow public lead submissions" ON public.leads
  FOR INSERT 
  WITH CHECK (true);