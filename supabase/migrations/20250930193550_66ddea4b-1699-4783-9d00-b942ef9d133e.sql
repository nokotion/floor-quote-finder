-- ============================================================================
-- CRITICAL SECURITY FIXES
-- ============================================================================

-- 1. SECURE RETAILER APPLICATIONS TABLE
-- Remove public insert policy and add authentication requirement
DROP POLICY IF EXISTS "Public can submit retailer applications" ON public.retailer_applications;

-- Add authenticated insert policy with validation
CREATE POLICY "Authenticated users can submit retailer applications"
ON public.retailer_applications
FOR INSERT
TO authenticated
WITH CHECK (
  -- Ensure email is provided and valid format
  email IS NOT NULL AND 
  email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' AND
  -- Ensure required fields are present
  business_name IS NOT NULL AND
  contact_name IS NOT NULL AND
  phone IS NOT NULL AND
  city IS NOT NULL AND
  postal_code IS NOT NULL
);

-- 2. SECURE ANALYTICS EVENTS TABLE
-- Remove public insert policy and add authentication requirement
DROP POLICY IF EXISTS "Public can insert analytics events" ON public.analytics_events;

-- Add authenticated insert policy
CREATE POLICY "Authenticated users can insert analytics events"
ON public.analytics_events
FOR INSERT
TO authenticated
WITH CHECK (
  event_name IS NOT NULL AND
  event_category IS NOT NULL
);

-- 3. UPDATE DATABASE FUNCTIONS - ADD PROPER search_path
-- Update admin_verify_lead function
CREATE OR REPLACE FUNCTION public.admin_verify_lead(p_lead_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Check if user is admin using the secure function
  IF NOT public.is_current_user_admin() THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  UPDATE public.leads
  SET is_verified = true,
      verified_at = now(),
      verification_token = null,
      verification_expires_at = null
  WHERE id = p_lead_id;
END;
$function$;

-- Update calculate_postal_distance function
CREATE OR REPLACE FUNCTION public.calculate_postal_distance(postal1 text, postal2 text)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- This is a placeholder function
  -- In production, you'd integrate with a postal code distance API
  -- For now, return a random distance between 1-50km for testing
  RETURN (RANDOM() * 50)::DECIMAL(8,2);
END;
$function$;

-- Update generate_slug function
CREATE OR REPLACE FUNCTION public.generate_slug(input_text text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN lower(
    regexp_replace(
      regexp_replace(
        regexp_replace(input_text, '[^a-zA-Z0-9\s-]', '', 'g'),
        '\s+', '-', 'g'
      ),
      '-+', '-', 'g'
    )
  );
END;
$function$;

-- Update handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Update is_admin_user function
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
END;
$function$;

-- Update update_retailer_application_updated_at function
CREATE OR REPLACE FUNCTION public.update_retailer_application_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Update handle_impersonation_update function
CREATE OR REPLACE FUNCTION public.handle_impersonation_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- 4. ADD RATE LIMITING TABLE FOR APPLICATION SUBMISSIONS
CREATE TABLE IF NOT EXISTS public.application_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  ip_address text,
  submission_count integer DEFAULT 1,
  last_submission_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on rate limiting table
ALTER TABLE public.application_rate_limits ENABLE ROW LEVEL SECURITY;

-- Only admins can view rate limit data
CREATE POLICY "Admins can view rate limit data"
ON public.application_rate_limits
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_application_rate_limits_email ON public.application_rate_limits(email);
CREATE INDEX IF NOT EXISTS idx_application_rate_limits_ip ON public.application_rate_limits(ip_address);

-- 5. ADD SECURITY EVENT LOGGING TABLE
CREATE TABLE IF NOT EXISTS public.security_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  user_id uuid REFERENCES auth.users(id),
  ip_address text,
  user_agent text,
  event_data jsonb,
  severity text CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on security events table
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- Only admins can view security events
CREATE POLICY "Admins can view security events"
ON public.security_events
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- Admins can insert security events
CREATE POLICY "Admins can insert security events"
ON public.security_events
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- Create indexes for security event analysis
CREATE INDEX IF NOT EXISTS idx_security_events_type ON public.security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON public.security_events(severity);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON public.security_events(created_at DESC);