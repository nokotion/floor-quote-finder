-- Clean up all existing data
DELETE FROM public.retailers;
DELETE FROM public.profiles;

-- Note: Auth users cleanup and new admin account creation must be done 
-- through Supabase Auth dashboard since we cannot directly manipulate auth.users
-- from migrations due to security restrictions