-- Re-add Unifloor brand that was previously deleted
INSERT INTO flooring_brands (
  name,
  slug,
  logo_url,
  categories,
  featured
) VALUES (
  'Unifloor',
  generate_slug('Unifloor'),
  'https://syjxtyvsencbmhuprnyu.supabase.co/storage/v1/object/public/brand-logos/Unifloor-Logo-.png',
  'vinyl, laminate',
  false
);