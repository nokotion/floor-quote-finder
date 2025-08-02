-- Critical Security Fixes Migration

-- 1. Enable RLS on brands_backup table and restrict access to admins only
ALTER TABLE public.brands_backup ENABLE ROW LEVEL SECURITY;

-- Create policy to allow only admins to access brands_backup
CREATE POLICY "Only admins can access brands_backup" 
ON public.brands_backup 
FOR ALL 
USING (is_admin_user());

-- 2. Fix function search path vulnerabilities by adding SET search_path = ''
-- to all functions that don't have it set

CREATE OR REPLACE FUNCTION public.calculate_postal_distance(postal1 text, postal2 text)
 RETURNS numeric
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  -- This is a placeholder function
  -- In production, you'd integrate with a postal code distance API
  -- For now, return a random distance between 1-50km for testing
  RETURN (RANDOM() * 50)::DECIMAL(8,2);
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_retailer_application_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_impersonation_update()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  IF (OLD.impersonated_by IS DISTINCT FROM NEW.impersonated_by OR 
      OLD.impersonation_started_at IS DISTINCT FROM NEW.impersonation_started_at OR 
      OLD.impersonation_expires_at IS DISTINCT FROM NEW.impersonation_expires_at) THEN
    NEW.updated_at = now();
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_current_user_admin()
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.generate_slug(input_text text)
 RETURNS text
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  RETURN lower(
    regexp_replace(
      regexp_replace(
        regexp_replace(input_text, '[^a-zA-Z0-9\s-]', '', 'g'), -- Remove special chars except spaces and hyphens
        '\s+', '-', 'g'  -- Replace spaces with hyphens
      ),
      '-+', '-', 'g'  -- Replace multiple hyphens with single hyphen
    )
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_admin_user()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, role, password_reset_required)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'customer'),
    COALESCE((NEW.raw_user_meta_data ->> 'password_reset_required')::boolean, false)
  );
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;