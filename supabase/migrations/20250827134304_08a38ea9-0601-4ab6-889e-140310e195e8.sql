-- Create a simple test admin account
-- Since we can't directly insert into auth.users, let's prepare for a manual signup

-- First, let's create a temporary admin signup that can be converted
INSERT INTO public.profiles (
    id,
    first_name,
    last_name,
    role,
    password_reset_required
) VALUES (
    gen_random_uuid(),
    'Inspector',
    'Admin',
    'admin',
    false
) ON CONFLICT (id) DO NOTHING;

-- Or update existing profile to admin role
UPDATE public.profiles 
SET role = 'admin', 
    first_name = 'Inspector',
    last_name = 'Admin',
    password_reset_required = false
WHERE id = (SELECT id FROM auth.users WHERE email = 'mehmetekutlu@gmail.com');