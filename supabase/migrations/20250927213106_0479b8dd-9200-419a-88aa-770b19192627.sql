-- Complete Brand Database Update Migration
-- Remove unwanted brands
DELETE FROM public.flooring_brands WHERE name IN ('NewTechWood', 'Shnier');

-- Update categories for existing brands
UPDATE public.flooring_brands SET categories = '{tile,vinyl,laminate,hardwood}' WHERE name = '1867';
UPDATE public.flooring_brands SET categories = '{vinyl}' WHERE name = '4 Corners';
UPDATE public.flooring_brands SET categories = '{tile}' WHERE name = 'Anatolia';
UPDATE public.flooring_brands SET categories = '{carpet,hardwood,vinyl,laminate}' WHERE name = 'Beaulieu';
UPDATE public.flooring_brands SET categories = '{tile,carpet,sports,vinyl}' WHERE name = 'Centura';
UPDATE public.flooring_brands SET categories = '{vinyl,laminate}' WHERE name = 'Evergreen';
UPDATE public.flooring_brands SET categories = '{vinyl}' WHERE name = 'Flooring Terminal';
UPDATE public.flooring_brands SET categories = '{vinyl,laminate,carpet,hardwood}' WHERE name = 'Fuzion';
UPDATE public.flooring_brands SET categories = '{carpet,hardwood,vinyl,laminate}' WHERE name = 'Mohawk';
UPDATE public.flooring_brands SET categories = '{sports}' WHERE name = 'Perfect Surfaces';
UPDATE public.flooring_brands SET categories = '{hardwood,vinyl,laminate}' WHERE name = 'Pravada Floors';
UPDATE public.flooring_brands SET categories = '{hardwood}' WHERE name = 'Purparkett';
UPDATE public.flooring_brands SET categories = '{laminate}' WHERE name = 'Quickstyle';
UPDATE public.flooring_brands SET categories = '{vinyl,hardwood}' WHERE name = 'Riche';
UPDATE public.flooring_brands SET categories = '{sports}' WHERE name = 'Rymar';
UPDATE public.flooring_brands SET categories = '{carpet,vinyl,laminate,hardwood}', logo_url = '/brand-logos/shaw-floor.png' WHERE name = 'Shaw Floor';
UPDATE public.flooring_brands SET categories = '{hardwood,vinyl}' WHERE name = 'Simba';

-- Insert new brands
INSERT INTO public.flooring_brands (name, categories, logo_url, slug, featured, created_at, updated_at) VALUES
('Evoke', '{vinyl,laminate}', '/brand-logos/evoke.webp', 'evoke', false, now(), now()),
('Kentwood', '{hardwood}', '/brand-logos/kentwood.webp', 'kentwood', false, now(), now()),
('Divine Floor', '{hardwood,vinyl}', '/brand-logos/divine-floor.jpg', 'divine-floor', false, now(), now()),
('Preverco', '{hardwood}', '/brand-logos/preverco.png', 'preverco', false, now(), now()),
('Sunca Forest Product', '{hardwood}', '/brand-logos/sunca-forest-product.png', 'sunca-forest-product', false, now(), now());

-- Add Coswick logo (assuming this brand already exists)
UPDATE public.flooring_brands SET logo_url = '/brand-logos/coswick.png' WHERE name = 'Coswick';