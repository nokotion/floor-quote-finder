-- Clean up all existing data
DELETE FROM public.retailers;
DELETE FROM public.profiles;

-- Note: Deleting from auth.users requires service role access
-- We'll clean up auth.users via the Supabase dashboard after this migration

-- Insert admin profile (will be linked to auth user after creation)
INSERT INTO public.profiles (
  id, 
  first_name, 
  last_name, 
  role, 
  created_at, 
  updated_at
) VALUES (
  gen_random_uuid(), -- temporary ID, will be updated when auth user is created
  'Mehmet',
  'Ekutlu', 
  'admin',
  now(),
  now()
);

-- Note: The auth.users table cleanup and admin account creation
-- will need to be done through Supabase Auth Admin panel
-- Email: mehmetekutlu@gmail.com
-- Password: Set during creation via dashboard