-- Delete Unifloor brand
DELETE FROM flooring_brands 
WHERE name = 'Unifloor';

-- Update existing brands with new logos
UPDATE flooring_brands 
SET logo_url = 'https://syjxtyvsencbmhuprnyu.supabase.co/storage/v1/object/public/brand-logos//vintage%20logo.jpg'
WHERE name = 'Vintage';

UPDATE flooring_brands 
SET logo_url = 'https://syjxtyvsencbmhuprnyu.supabase.co/storage/v1/object/public/brand-logos//wickham.png'
WHERE name = 'Wickham Hardwood';

UPDATE flooring_brands 
SET logo_url = 'https://syjxtyvsencbmhuprnyu.supabase.co/storage/v1/object/public/brand-logos//woden.png'
WHERE name = 'Woden';

UPDATE flooring_brands 
SET logo_url = 'https://syjxtyvsencbmhuprnyu.supabase.co/storage/v1/object/public/brand-logos//xl%20flooring.webp'
WHERE name = 'XL Flooring';

-- Update existing Home's Pro brand with logo
UPDATE flooring_brands 
SET logo_url = 'https://syjxtyvsencbmhuprnyu.supabase.co/storage/v1/object/public/brand-logos//homes%20pro.png'
WHERE name = 'Home''s Pro';