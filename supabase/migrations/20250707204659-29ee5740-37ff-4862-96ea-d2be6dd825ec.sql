-- Create test user account for retailer login
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  aud,
  role
) VALUES (
  '033a38d4-c669-48d5-a9de-0380eac43c4a',
  '00000000-0000-0000-0000-000000000000',
  'info@squarefootflooring.com',
  crypt('password123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"role":"retailer"}',
  'authenticated',
  'authenticated'
);

-- Update the retailer record to link to this user
UPDATE public.retailers 
SET user_id = '033a38d4-c669-48d5-a9de-0380eac43c4a'
WHERE email = 'info@squarefootflooring.com';

-- Create/update profile record to link user to retailer
INSERT INTO public.profiles (id, retailer_id, role)
SELECT 
  '033a38d4-c669-48d5-a9de-0380eac43c4a',
  r.id,
  'retailer'
FROM public.retailers r 
WHERE r.email = 'info@squarefootflooring.com'
ON CONFLICT (id) DO UPDATE SET
  retailer_id = EXCLUDED.retailer_id,
  role = EXCLUDED.role;