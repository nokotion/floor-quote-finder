-- Create a test admin user in auth.users and profiles
-- First, let's create a simple test admin account

-- Insert into auth.users (this is for development/testing purposes)
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_sso_user
) VALUES (
  gen_random_uuid(),
  'test@admin.com',
  crypt('admin123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"first_name":"Test","last_name":"Admin","role":"admin"}',
  false
) ON CONFLICT (email) DO NOTHING;

-- Get the user ID for the profile
DO $$
DECLARE
    user_uuid uuid;
BEGIN
    SELECT id INTO user_uuid FROM auth.users WHERE email = 'test@admin.com';
    
    -- Insert corresponding profile
    INSERT INTO public.profiles (
        id,
        first_name,
        last_name,
        role,
        password_reset_required
    ) VALUES (
        user_uuid,
        'Test',
        'Admin',
        'admin',
        false
    ) ON CONFLICT (id) DO UPDATE SET
        role = 'admin',
        first_name = 'Test',
        last_name = 'Admin',
        password_reset_required = false;
END $$;