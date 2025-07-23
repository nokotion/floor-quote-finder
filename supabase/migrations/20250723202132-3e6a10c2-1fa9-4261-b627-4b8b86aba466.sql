-- Enable public read access to flooring brands
CREATE POLICY "Anyone can view flooring brands" 
ON public.flooring_brands 
FOR SELECT 
USING (true);