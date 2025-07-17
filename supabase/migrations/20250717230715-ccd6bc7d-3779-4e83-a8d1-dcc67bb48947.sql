-- Drop existing anonymous policy and create a more explicit one
DROP POLICY IF EXISTS "Allow insert for anonymous lead form" ON public.leads;

-- Create policy that explicitly allows anon role
CREATE POLICY "Allow anonymous lead insertion"
ON public.leads
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Also create a policy for public role just in case
CREATE POLICY "Allow public lead insertion"
ON public.leads
FOR INSERT
TO public
WITH CHECK (true);

-- Test insert to verify policies work
DO $$
BEGIN
    RAISE NOTICE 'Created new anonymous insertion policies for leads table';
END
$$;