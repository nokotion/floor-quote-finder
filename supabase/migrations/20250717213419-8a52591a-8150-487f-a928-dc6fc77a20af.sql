
-- Drop existing public insert policy
DROP POLICY IF EXISTS "Public can insert leads" ON public.leads;

-- Create a new policy that explicitly allows anonymous lead insertions
CREATE POLICY "Allow insert for anonymous lead form"
ON public.leads
FOR INSERT
WITH CHECK (true);
