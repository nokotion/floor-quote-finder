-- Fix the lead submission policy to allow anyone (including retailers) to submit leads
DROP POLICY IF EXISTS "Allow public lead submissions" ON public.leads;

-- Create new policy that allows anyone to submit leads
CREATE POLICY "Allow public lead submissions" ON public.leads
  FOR INSERT 
  TO anon, authenticated
  WITH CHECK (
    customer_name IS NOT NULL 
    AND customer_email IS NOT NULL 
    AND postal_code IS NOT NULL
    AND status = 'pending_verification'
    AND (
      -- Allow anonymous users 
      auth.uid() IS NULL 
      OR 
      -- Allow any authenticated user to submit leads (including retailers)
      auth.uid() IS NOT NULL
    )
  );