-- Phase 1: Critical Database Function Hardening
-- Update security-critical functions with secure search path to prevent schema poisoning attacks

-- Update is_current_user_admin function
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
END;
$function$;

-- Update admin_verify_lead function
CREATE OR REPLACE FUNCTION public.admin_verify_lead(p_lead_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  -- Check if user is admin using the secure function
  if not public.is_current_user_admin() then
    raise exception 'forbidden';
  end if;

  update public.leads
  set is_verified = true,
      verified_at = now(),
      verification_token = null,
      verification_expires_at = null
  where id = p_lead_id;
end;
$function$;

-- Update is_admin_user function
CREATE OR REPLACE FUNCTION public.is_admin_user()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
END;
$function$;

-- Update calculate_postal_distance function
CREATE OR REPLACE FUNCTION public.calculate_postal_distance(postal1 text, postal2 text)
 RETURNS numeric
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  -- This is a placeholder function
  -- In production, you'd integrate with a postal code distance API
  -- For now, return a random distance between 1-50km for testing
  RETURN (RANDOM() * 50)::DECIMAL(8,2);
END;
$function$;