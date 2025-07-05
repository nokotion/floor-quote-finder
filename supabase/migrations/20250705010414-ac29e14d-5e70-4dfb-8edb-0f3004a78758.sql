-- Remove unwanted brands
DELETE FROM flooring_brands 
WHERE name IN ('Canaan Flooring', 'Luxury Vinyl Pro', 'Mohawk Flooring');

-- Update brand logos
UPDATE flooring_brands 
SET logo_url = 'https://syjxtyvsencbmhuprnyu.supabase.co/storage/v1/object/public/brand-logos//homes%20pro.png'
WHERE name = 'Home''s Pro';

UPDATE flooring_brands 
SET logo_url = 'https://syjxtyvsencbmhuprnyu.supabase.co/storage/v1/object/public/brand-logos//impressive%20floors.avif'
WHERE name = 'Impressive Floors';

UPDATE flooring_brands 
SET logo_url = 'https://syjxtyvsencbmhuprnyu.supabase.co/storage/v1/object/public/brand-logos//jl%20tile.png'
WHERE name = 'JL Tile';

UPDATE flooring_brands 
SET logo_url = 'https://syjxtyvsencbmhuprnyu.supabase.co/storage/v1/object/public/brand-logos//melange-floors%20logo.png'
WHERE name = 'Melange';

UPDATE flooring_brands 
SET logo_url = 'https://syjxtyvsencbmhuprnyu.supabase.co/storage/v1/object/public/brand-logos//melange-floors%20logo.png'
WHERE name = 'Mercier';

UPDATE flooring_brands 
SET logo_url = 'https://syjxtyvsencbmhuprnyu.supabase.co/storage/v1/object/public/brand-logos//midgley%20west%20logo.jpg'
WHERE name = 'Midgley West';

UPDATE flooring_brands 
SET logo_url = 'https://syjxtyvsencbmhuprnyu.supabase.co/storage/v1/object/public/brand-logos//Mohawk.png'
WHERE name = 'Mohawk';

UPDATE flooring_brands 
SET logo_url = 'https://syjxtyvsencbmhuprnyu.supabase.co/storage/v1/object/public/brand-logos//naf.jpg'
WHERE name = 'NAF Flooring';

UPDATE flooring_brands 
SET logo_url = 'https://syjxtyvsencbmhuprnyu.supabase.co/storage/v1/object/public/brand-logos//neshada.png'
WHERE name = 'Neshada Tile';

UPDATE flooring_brands 
SET logo_url = 'https://syjxtyvsencbmhuprnyu.supabase.co/storage/v1/object/public/brand-logos//newtech%20logo.png'
WHERE name = 'NewTechWood';