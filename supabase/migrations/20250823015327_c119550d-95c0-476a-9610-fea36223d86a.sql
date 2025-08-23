-- Fix remaining functions that need secure search path
-- Update handle_impersonation_update function
CREATE OR REPLACE FUNCTION public.handle_impersonation_update()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
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

-- Update generate_slug function
CREATE OR REPLACE FUNCTION public.generate_slug(input_text text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
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