-- Create test retailer accounts and admin account
-- Note: Passwords will need to be set manually in Supabase Auth UI or via signup

-- First, let's create some test retailers in the retailers table
INSERT INTO public.retailers (
  business_name,
  contact_name,
  email,
  phone,
  city,
  province,
  postal_code,
  status,
  postal_code_prefixes,
  installation_preference,
  urgency_preference
) VALUES 
(
  'Test Flooring Solutions Inc.',
  'John Smith',
  'retailer1@test.com',
  '416-555-0101',
  'Toronto',
  'ON',
  'M5V',
  'active',
  ARRAY['M5V', 'M5W', 'M5X'],
  'both',
  'any'
),
(
  'Premium Floor Co.',
  'Sarah Johnson',
  'retailer2@test.com',
  '416-555-0102',
  'Toronto',
  'ON',
  'M4W',
  'active',
  ARRAY['M4W', 'M4X', 'M4Y'],
  'supply_and_install',
  'asap_only'
),
(
  'Budget Floors Ltd.',
  'Mike Wilson',
  'retailer3@test.com',
  '416-555-0103',
  'Toronto',
  'ON',
  'M6K',
  'active',
  ARRAY['M6K', 'M6L'],
  'supply_only',
  'flexible'
);

-- Create brand subscriptions for test retailers
INSERT INTO public.brand_subscriptions (
  retailer_id,
  brand_name,
  is_active,
  lead_price,
  sqft_tier_min,
  sqft_tier_max
) 
SELECT 
  r.id,
  brands.brand_name,
  true,
  5.00,
  brands.min_sqft,
  brands.max_sqft
FROM public.retailers r
CROSS JOIN (
  VALUES 
    ('Shaw Floors', 0, 999999),
    ('Mohawk Flooring', 0, 999999),
    ('Bruce Hardwood', 0, 999999),
    ('Daltile', 0, 999999),
    ('Luxury Vinyl Pro', 0, 999999)
) AS brands(brand_name, min_sqft, max_sqft)
WHERE r.email IN ('retailer1@test.com', 'retailer2@test.com');

-- Create limited brand subscriptions for retailer3 (budget retailer)
INSERT INTO public.brand_subscriptions (
  retailer_id,
  brand_name,
  is_active,
  lead_price,
  sqft_tier_min,
  sqft_tier_max
) 
SELECT 
  r.id,
  'Luxury Vinyl Pro',
  true,
  3.00,
  0,
  1000
FROM public.retailers r
WHERE r.email = 'retailer3@test.com';

-- Create lead credits for retailers (retailer1 and retailer2 get credits, retailer3 has none for testing Stripe)
INSERT INTO public.retailer_lead_credits (
  retailer_id,
  credits_remaining,
  credits_used,
  last_purchase_date
)
SELECT 
  r.id,
  CASE 
    WHEN r.email = 'retailer1@test.com' THEN 10
    WHEN r.email = 'retailer2@test.com' THEN 15
    ELSE 0
  END,
  CASE 
    WHEN r.email = 'retailer1@test.com' THEN 5
    WHEN r.email = 'retailer2@test.com' THEN 3
    ELSE 0
  END,
  CASE 
    WHEN r.email IN ('retailer1@test.com', 'retailer2@test.com') THEN now() - interval '30 days'
    ELSE NULL
  END
FROM public.retailers r
WHERE r.email IN ('retailer1@test.com', 'retailer2@test.com', 'retailer3@test.com');

-- Create some sample flooring brands if they don't exist
INSERT INTO public.flooring_brands (name, slug, categories, featured, description)
VALUES 
  ('Shaw Floors', 'shaw-floors', 'Hardwood, Laminate, Vinyl, Carpet', true, 'Premium flooring solutions with industry-leading warranties'),
  ('Mohawk Flooring', 'mohawk-flooring', 'Hardwood, Laminate, Vinyl, Carpet, Tile', true, 'Innovative flooring products for every lifestyle'),
  ('Bruce Hardwood', 'bruce-hardwood', 'Hardwood', true, 'Authentic hardwood floors crafted with precision'),
  ('Daltile', 'daltile', 'Tile', true, 'Beautiful ceramic and natural stone tiles'),
  ('Luxury Vinyl Pro', 'luxury-vinyl-pro', 'Vinyl', false, 'Waterproof luxury vinyl plank flooring')
ON CONFLICT (slug) DO NOTHING;

-- Create a sample lead for testing
INSERT INTO public.leads (
  customer_name,
  customer_email,
  customer_phone,
  postal_code,
  brand_requested,
  square_footage,
  project_type,
  installation_required,
  timeline,
  notes,
  status
) VALUES (
  'Test Customer',
  'testcustomer@example.com',
  '416-555-9999',
  'M5V 1A1',
  'Shaw Floors',
  750,
  'Living Room',
  true,
  'Within 1 month',
  'Looking for high-quality hardwood floors for a condo renovation',
  'new'
);