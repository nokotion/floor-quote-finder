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

-- Add new brand: Homes Pro
INSERT INTO flooring_brands (name, slug, logo_url, categories, featured)
VALUES (
  'Homes Pro',
  'homes-pro',
  'https://syjxtyvsencbmhuprnyu.supabase.co/storage/v1/object/public/brand-logos//homes%20pro.png',
  'vinyl, laminate',
  false
);