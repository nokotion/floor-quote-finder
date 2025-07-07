-- Update existing user password and confirm email
UPDATE auth.users 
SET 
  encrypted_password = crypt('password123', gen_salt('bf')),
  email_confirmed_at = now(),
  updated_at = now()
WHERE email = 'info@squarefootflooring.com';

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