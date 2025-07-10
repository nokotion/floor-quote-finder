-- Fix Mercier logo with exact name (including trailing space)
UPDATE flooring_brands 
SET logo_url = 'https://syjxtyvsencbmhuprnyu.supabase.co/storage/v1/object/public/brand-logos//mercier%20logo.jpg'
WHERE name = 'Mercier ';

-- Clean up Mercier brand name by trimming whitespace
UPDATE flooring_brands 
SET name = TRIM(name)
WHERE name = 'Mercier ';

-- Clean up all brand names to prevent future whitespace issues
UPDATE flooring_brands 
SET name = TRIM(name)
WHERE name != TRIM(name);