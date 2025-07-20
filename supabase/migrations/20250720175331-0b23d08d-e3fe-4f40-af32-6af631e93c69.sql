
-- Drop the existing restrictive policy that's blocking anonymous users
DROP POLICY IF EXISTS "Allow lead submissions with verification status" ON public.leads;

-- Create new policy that allows both authenticated and anonymous users to insert leads
-- for verification purposes while maintaining data integrity
CREATE POLICY "Allow lead submissions with verification status"
ON public.leads
FOR INSERT
WITH CHECK (
  (status = 'pending_verification' AND is_verified = false)
  OR
  (status = 'verified' AND is_verified = true)
);
