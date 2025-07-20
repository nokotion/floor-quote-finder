
-- Drop previous policies
DROP POLICY IF EXISTS "Allow lead submissions with verification status" ON public.leads;

-- Create corrected policy that explicitly allows anonymous users to insert
CREATE POLICY "Allow verification leads insert (anon + auth)" 
ON public.leads 
FOR INSERT 
TO public  -- This allows both authenticated and anonymous users
USING (
  (status = 'pending_verification' AND is_verified = false)
  OR
  (status = 'verified' AND is_verified = true)
)
WITH CHECK (
  (status = 'pending_verification' AND is_verified = false)
  OR
  (status = 'verified' AND is_verified = true)
);
