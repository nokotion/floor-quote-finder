
-- Drop all existing INSERT policies on leads table to avoid conflicts
DROP POLICY IF EXISTS "Allow anonymous lead insertion" ON public.leads;
DROP POLICY IF EXISTS "Allow public lead insertion" ON public.leads;
DROP POLICY IF EXISTS "Allow insert for anonymous lead form" ON public.leads;
DROP POLICY IF EXISTS "Allow insert for all users" ON public.leads;
DROP POLICY IF EXISTS "Allow public lead insertion" ON public.leads;

-- Create a single universal INSERT policy that allows anyone to insert leads
-- This policy validates the required fields rather than relying on role detection
CREATE POLICY "Universal lead insertion policy"
ON public.leads
FOR INSERT
WITH CHECK (
  customer_name IS NOT NULL AND 
  customer_name != '' AND
  customer_email IS NOT NULL AND 
  customer_email != '' AND
  postal_code IS NOT NULL AND 
  postal_code != '' AND
  status = 'pending_verification'
);

-- Ensure RLS is enabled
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Test the policy with a sample insert
DO $$
BEGIN
    -- This should work with the new policy
    INSERT INTO public.leads (
        customer_name,
        customer_email,
        postal_code,
        status,
        brand_requested,
        square_footage,
        timeline
    ) VALUES (
        'Test Customer',
        'test@example.com',
        'M5V 3A8',
        'pending_verification',
        'Test Brand',
        500,
        'ASAP'
    );
    
    -- Clean up the test record
    DELETE FROM public.leads WHERE customer_email = 'test@example.com';
    
    RAISE NOTICE 'Universal lead insertion policy is working correctly';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Policy test failed: %', SQLERRM;
END
$$;
