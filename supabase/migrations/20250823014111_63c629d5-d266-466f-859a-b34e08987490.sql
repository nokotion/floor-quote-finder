-- Fix critical security vulnerabilities in retailers and pricing_plans tables

-- 1. Fix retailers table - remove public access to sensitive business data
DROP POLICY IF EXISTS "Authenticated users can view retailer profiles" ON public.retailers;
DROP POLICY IF EXISTS "Anyone can view retailer profiles" ON public.retailers;
DROP POLICY IF EXISTS "Public can view retailers" ON public.retailers;

-- Ensure retailers table only allows:
-- - Retailers to view their own data
-- - Admins to view all data
-- Keep existing secure policies intact

-- 2. Fix pricing_plans table - restrict public access to pricing strategy
DROP POLICY IF EXISTS "Anyone can view active pricing plans" ON public.pricing_plans;

-- Create restricted policy for pricing plans
CREATE POLICY "Authenticated users can view active pricing plans during signup" 
ON public.pricing_plans 
FOR SELECT 
USING (is_active = true AND auth.role() = 'authenticated');

-- 3. Fix database functions missing search_path for security
CREATE OR REPLACE FUNCTION public.calculate_postal_distance(postal1 text, postal2 text)
 RETURNS numeric
 LANGUAGE plpgsql
 SECURITY DEFINER
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
 SECURITY DEFINER
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
 SECURITY DEFINER
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

CREATE OR REPLACE FUNCTION public.generate_slug(input_text text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
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