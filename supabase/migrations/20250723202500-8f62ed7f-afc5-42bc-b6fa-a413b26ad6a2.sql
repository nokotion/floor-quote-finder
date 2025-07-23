-- Drop old policy if needed
DROP POLICY IF EXISTS "Anyone can view flooring brands" ON public.flooring_brands;

-- Add a very broad read policy
CREATE POLICY "Public read access to flooring_brands"
ON public.flooring_brands
FOR SELECT
TO public
USING (true);

-- Grant explicit access to anon role
GRANT SELECT ON public.flooring_brands TO anon;