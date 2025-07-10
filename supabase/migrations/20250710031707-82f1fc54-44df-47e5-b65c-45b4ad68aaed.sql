-- Update brand logos for existing brands
UPDATE flooring_brands 
SET logo_url = 'https://syjxtyvsencbmhuprnyu.supabase.co/storage/v1/object/public/brand-logos//mercier%20logo.jpg'
WHERE name = 'Mercier';

UPDATE flooring_brands 
SET logo_url = 'https://syjxtyvsencbmhuprnyu.supabase.co/storage/v1/object/public/brand-logos//olympia%20tile%20logo.jpg'
WHERE name = 'Olympia Tile';

UPDATE flooring_brands 
SET logo_url = 'https://syjxtyvsencbmhuprnyu.supabase.co/storage/v1/object/public/brand-logos//patcraft_logo.jpg'
WHERE name = 'Patcraft';

UPDATE flooring_brands 
SET logo_url = 'https://syjxtyvsencbmhuprnyu.supabase.co/storage/v1/object/public/brand-logos//perfect-surface-logo.jpg'
WHERE name = 'Perfect Surfaces';

UPDATE flooring_brands 
SET logo_url = 'https://syjxtyvsencbmhuprnyu.supabase.co/storage/v1/object/public/brand-logos//pravada-logo.webp'
WHERE name = 'Pravada';

UPDATE flooring_brands 
SET logo_url = 'https://syjxtyvsencbmhuprnyu.supabase.co/storage/v1/object/public/brand-logos//PURELUX.jpg'
WHERE name = 'Purelux';

UPDATE flooring_brands 
SET logo_url = 'https://syjxtyvsencbmhuprnyu.supabase.co/storage/v1/object/public/brand-logos//PurparketLogo.png'
WHERE name = 'Purparket';

UPDATE flooring_brands 
SET logo_url = 'https://syjxtyvsencbmhuprnyu.supabase.co/storage/v1/object/public/brand-logos//Riche-Flooring-Sunshiny-Flooring.jpg'
WHERE name = 'Riche';

UPDATE flooring_brands 
SET logo_url = 'https://syjxtyvsencbmhuprnyu.supabase.co/storage/v1/object/public/brand-logos//Rymar-Logo.webp'
WHERE name = 'Rymar';

UPDATE flooring_brands 
SET logo_url = 'https://syjxtyvsencbmhuprnyu.supabase.co/storage/v1/object/public/brand-logos//shnier.png'
WHERE name = 'Shnier';

UPDATE flooring_brands 
SET logo_url = 'https://syjxtyvsencbmhuprnyu.supabase.co/storage/v1/object/public/brand-logos//simba.png'
WHERE name = 'Simba';

UPDATE flooring_brands 
SET logo_url = 'https://syjxtyvsencbmhuprnyu.supabase.co/storage/v1/object/public/brand-logos//torlys.png'
WHERE name = 'Torlys';

UPDATE flooring_brands 
SET logo_url = 'https://syjxtyvsencbmhuprnyu.supabase.co/storage/v1/object/public/brand-logos//traffix.jpeg'
WHERE name = 'Traffix';

UPDATE flooring_brands 
SET logo_url = 'https://syjxtyvsencbmhuprnyu.supabase.co/storage/v1/object/public/brand-logos//Triforest-Logo150_150.png'
WHERE name = 'Triforest';

UPDATE flooring_brands 
SET logo_url = 'https://syjxtyvsencbmhuprnyu.supabase.co/storage/v1/object/public/brand-logos//urban%20zebra.jpeg'
WHERE name = 'Urban Zebra';

-- Add new brand: Unifloor
INSERT INTO flooring_brands (name, slug, logo_url, categories, featured)
VALUES (
  'Unifloor',
  'unifloor',
  'https://syjxtyvsencbmhuprnyu.supabase.co/storage/v1/object/public/brand-logos//Unifloor-Logo-.png',
  'vinyl, laminate',
  false
);

-- Remove unwanted brands
DELETE FROM flooring_brands 
WHERE name IN ('Sapphirus Stone & Tile', 'Sapphirus', 'Sidco');