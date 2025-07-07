-- Update the existing profile to make it an admin
UPDATE public.profiles 
SET 
  role = 'admin',
  first_name = 'Mehmet',
  last_name = 'Ekutlu',
  updated_at = now()
WHERE id = '03c68991-ed22-482a-9d66-b8bcdbe6c524';