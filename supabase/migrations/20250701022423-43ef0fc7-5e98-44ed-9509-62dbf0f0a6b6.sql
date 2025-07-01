
-- Clean up existing logo URLs and replace with proper Supabase storage URLs
-- Remove all images.app.goo.gl URLs and replace with Supabase storage URLs

-- Shaw Floors
UPDATE flooring_brands 
SET logo_url = 'https://syjxtyvsencbmhuprnyu.supabase.co/storage/v1/object/public/brand-logos/shaw_floors.png'
WHERE name = 'Shaw Floors' AND logo_url IS NOT NULL;

-- Mohawk
UPDATE flooring_brands 
SET logo_url = 'https://syjxtyvsencbmhuprnyu.supabase.co/storage/v1/object/public/brand-logos/mohawk.png'
WHERE name = 'Mohawk' AND logo_url IS NOT NULL;

-- Armstrong
UPDATE flooring_brands 
SET logo_url = 'https://syjxtyvsencbmhuprnyu.supabase.co/storage/v1/object/public/brand-logos/armstrong.png'
WHERE name = 'Armstrong' AND logo_url IS NOT NULL;

-- Mannington
UPDATE flooring_brands 
SET logo_url = 'https://syjxtyvsencbmhuprnyu.supabase.co/storage/v1/object/public/brand-logos/mannington.png'
WHERE name = 'Mannington' AND logo_url IS NOT NULL;

-- Tarkett
UPDATE flooring_brands 
SET logo_url = 'https://syjxtyvsencbmhuprnyu.supabase.co/storage/v1/object/public/brand-logos/tarkett.png'
WHERE name = 'Tarkett' AND logo_url IS NOT NULL;

-- COREtec
UPDATE flooring_brands 
SET logo_url = 'https://syjxtyvsencbmhuprnyu.supabase.co/storage/v1/object/public/brand-logos/coretec.png'
WHERE name = 'COREtec' AND logo_url IS NOT NULL;

-- Lifeproof
UPDATE flooring_brands 
SET logo_url = 'https://syjxtyvsencbmhuprnyu.supabase.co/storage/v1/object/public/brand-logos/lifeproof.png'
WHERE name = 'Lifeproof' AND logo_url IS NOT NULL;

-- NuCore
UPDATE flooring_brands 
SET logo_url = 'https://syjxtyvsencbmhuprnyu.supabase.co/storage/v1/object/public/brand-logos/nucore.png'
WHERE name = 'NuCore' AND logo_url IS NOT NULL;

-- SmartCore
UPDATE flooring_brands 
SET logo_url = 'https://syjxtyvsencbmhuprnyu.supabase.co/storage/v1/object/public/brand-logos/smartcore.png'
WHERE name = 'SmartCore' AND logo_url IS NOT NULL;

-- Pergo
UPDATE flooring_brands 
SET logo_url = 'https://syjxtyvsencbmhuprnyu.supabase.co/storage/v1/object/public/brand-logos/pergo.png'
WHERE name = 'Pergo' AND logo_url IS NOT NULL;

-- Remove any remaining images.app.goo.gl URLs that don't have a Supabase replacement
UPDATE flooring_brands 
SET logo_url = NULL 
WHERE logo_url LIKE '%images.app.goo.gl%';

-- Remove any other external URLs that aren't from our Supabase storage
UPDATE flooring_brands 
SET logo_url = NULL 
WHERE logo_url IS NOT NULL 
AND logo_url NOT LIKE 'https://syjxtyvsencbmhuprnyu.supabase.co/storage/v1/object/public/brand-logos/%';
