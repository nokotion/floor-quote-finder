-- Temporarily set password_reset_required flag for admin users to test the security fix
-- This ensures that clicking password reset links will show the reset form instead of granting immediate access

UPDATE public.profiles 
SET password_reset_required = true 
WHERE role = 'admin' 
  AND id IN (
    SELECT id FROM auth.users WHERE email = 'mehmetekutlu@gmail.com'
  );