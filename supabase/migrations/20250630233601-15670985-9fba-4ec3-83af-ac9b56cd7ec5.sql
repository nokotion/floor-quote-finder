
-- Add slug column to flooring_brands table
ALTER TABLE public.flooring_brands 
ADD COLUMN slug text;

-- Create a function to generate slugs from brand names
CREATE OR REPLACE FUNCTION public.generate_slug(input_text text)
RETURNS text
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN lower(
    regexp_replace(
      regexp_replace(
        regexp_replace(input_text, '[^a-zA-Z0-9\s-]', '', 'g'), -- Remove special chars except spaces and hyphens
        '\s+', '-', 'g'  -- Replace spaces with hyphens
      ),
      '-+', '-', 'g'  -- Replace multiple hyphens with single hyphen
    )
  );
END;
$$;

-- Populate existing brands with slugs
UPDATE public.flooring_brands 
SET slug = generate_slug(name) 
WHERE name IS NOT NULL;

-- Add unique constraint on slug column
ALTER TABLE public.flooring_brands 
ADD CONSTRAINT flooring_brands_slug_unique UNIQUE (slug);

-- Create index on slug for better performance
CREATE INDEX idx_flooring_brands_slug ON public.flooring_brands(slug);

-- Set slug as NOT NULL for future records
ALTER TABLE public.flooring_brands 
ALTER COLUMN slug SET NOT NULL;
