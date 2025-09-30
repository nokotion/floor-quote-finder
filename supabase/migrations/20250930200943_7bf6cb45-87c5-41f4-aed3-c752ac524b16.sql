-- ============================================================================
-- FIX REMAINING FUNCTION SECURITY ISSUES
-- Create sec schema security functions with proper search_path
-- ============================================================================

-- Create sec schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS sec;

-- 1. Create sec.is_admin() function with proper search_path
CREATE OR REPLACE FUNCTION sec.is_admin()
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
END;
$$;

-- 2. Create sec.is_retailer() function with proper search_path
CREATE OR REPLACE FUNCTION sec.is_retailer()
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id = auth.uid() 
    AND retailer_id IS NOT NULL
  );
END;
$$;

-- 3. Create sec.my_retailer_id() function with proper search_path
CREATE OR REPLACE FUNCTION sec.my_retailer_id()
RETURNS uuid
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (
    SELECT retailer_id 
    FROM public.profiles 
    WHERE id = auth.uid()
  );
END;
$$;

-- Grant execute permissions on sec schema functions
GRANT EXECUTE ON FUNCTION sec.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION sec.is_retailer() TO authenticated;
GRANT EXECUTE ON FUNCTION sec.my_retailer_id() TO authenticated;

-- Add comment documentation
COMMENT ON FUNCTION sec.is_admin() IS 'Returns true if the current user has admin role';
COMMENT ON FUNCTION sec.is_retailer() IS 'Returns true if the current user is associated with a retailer';
COMMENT ON FUNCTION sec.my_retailer_id() IS 'Returns the retailer_id for the current user';