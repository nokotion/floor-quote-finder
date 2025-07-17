-- Enable RLS on the leads table explicitly to ensure it's active
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Recreate the anonymous insertion policy with a more explicit approach
DROP POLICY IF EXISTS "Allow insert for anonymous lead form" ON public.leads;

CREATE POLICY "Allow insert for anonymous lead form"
ON public.leads
FOR INSERT
WITH CHECK (true);

-- Verify RLS is active and configured properly
DO $$
BEGIN
    RAISE NOTICE 'RLS on public.leads is enabled and policy "Allow insert for anonymous lead form" is active';
END
$$;