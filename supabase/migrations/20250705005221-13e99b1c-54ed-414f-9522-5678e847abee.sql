-- Remove unwanted brands
DELETE FROM flooring_brands 
WHERE name IN ('Affiliated Weavers', 'Baronwood', 'Bruce Flooring', 'Citiflor');

-- Update brand names and slugs
UPDATE flooring_brands 
SET name = 'Canaan Flooring', slug = 'canaan-flooring'
WHERE name = 'Canaan Wood';

UPDATE flooring_brands 
SET name = 'Eurotile', slug = 'eurotile'
WHERE name = 'Euro Tile and Stone';

UPDATE flooring_brands 
SET name = 'Evergreen', slug = 'evergreen'
WHERE name = 'Evergreen Building Supplies';

UPDATE flooring_brands 
SET name = 'Canadian Imported Flooring (CIFL)'
WHERE name = 'Canadian Imported Flooring';

-- Update brand logos
UPDATE flooring_brands 
SET logo_url = 'https://syjxtyvsencbmhuprnyu.supabase.co/storage/v1/object/public/brand-logos//4cornerslogo.png'
WHERE name = '4 Corners';

UPDATE flooring_brands 
SET logo_url = 'https://syjxtyvsencbmhuprnyu.supabase.co/storage/v1/object/public/brand-logos//anderson-tuftex-logo-.png'
WHERE name = 'Anderson Tuftex';

UPDATE flooring_brands 
SET logo_url = 'https://syjxtyvsencbmhuprnyu.supabase.co/storage/v1/object/public/brand-logos//appalaches-logo-.png'
WHERE name = 'Appalachian';

UPDATE flooring_brands 
SET logo_url = 'https://syjxtyvsencbmhuprnyu.supabase.co/storage/v1/object/public/brand-logos//bruce%20logo.png'
WHERE name = 'Bruce Hardwood';

UPDATE flooring_brands 
SET logo_url = 'https://syjxtyvsencbmhuprnyu.supabase.co/storage/v1/object/public/brand-logos//cifl.avif'
WHERE name = 'Canadian Imported Flooring (CIFL)';

UPDATE flooring_brands 
SET logo_url = 'https://syjxtyvsencbmhuprnyu.supabase.co/storage/v1/object/public/brand-logos//ciot%20logo.svg'
WHERE name = 'Ciot';

UPDATE flooring_brands 
SET logo_url = 'https://syjxtyvsencbmhuprnyu.supabase.co/storage/v1/object/public/brand-logos//ceratec%20logo.png'
WHERE name = 'Ceratec';

UPDATE flooring_brands 
SET logo_url = 'https://syjxtyvsencbmhuprnyu.supabase.co/storage/v1/object/public/brand-logos//coretec-logo.png'
WHERE name = 'Coretec';

UPDATE flooring_brands 
SET logo_url = 'https://syjxtyvsencbmhuprnyu.supabase.co/storage/v1/object/public/brand-logos//Daltile.jpg'
WHERE name = 'Daltile';

UPDATE flooring_brands 
SET logo_url = 'https://syjxtyvsencbmhuprnyu.supabase.co/storage/v1/object/public/brand-logos//dzn-logo.png'
WHERE name = 'DZN Concepts';

UPDATE flooring_brands 
SET logo_url = 'https://syjxtyvsencbmhuprnyu.supabase.co/storage/v1/object/public/brand-logos//Euro-Logo.png'
WHERE name = 'Eurotile';

UPDATE flooring_brands 
SET logo_url = 'https://syjxtyvsencbmhuprnyu.supabase.co/storage/v1/object/public/brand-logos//EVERGREEN.png'
WHERE name = 'Evergreen';

UPDATE flooring_brands 
SET logo_url = 'https://syjxtyvsencbmhuprnyu.supabase.co/storage/v1/object/public/brand-logos//flooring%20terminal%20logo.png'
WHERE name = 'Flooring Terminal';

UPDATE flooring_brands 
SET logo_url = 'https://syjxtyvsencbmhuprnyu.supabase.co/storage/v1/object/public/brand-logos//goodfellow-logo.png'
WHERE name = 'Goodfellow';