-- Harden retailers table RLS: remove public read, allow only authenticated users to read

-- Ensure RLS is enabled (should already be, but keep for safety)
ALTER TABLE public.retailers ENABLE ROW LEVEL SECURITY;

-- Drop overly permissive public read policy
DROP POLICY IF EXISTS "Users can view retailer profiles" ON public.retailers;

-- Restrict read access to authenticated users only
CREATE POLICY "Authenticated users can view retailer profiles"
ON public.retailers
FOR SELECT
TO authenticated
USING (true);
