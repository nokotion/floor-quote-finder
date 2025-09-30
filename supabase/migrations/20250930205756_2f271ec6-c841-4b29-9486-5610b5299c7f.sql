-- CRITICAL SECURITY FIX: Remove overly permissive policy on retailer_requests
-- This policy was allowing ANY authenticated user to read sensitive business information
-- including company names, emails, phone numbers, and contact details

DROP POLICY IF EXISTS "Allow admin + authenticated" ON public.retailer_requests;

-- Verify that admin-only policies remain in place:
-- "Admins can view all retailer requests" (SELECT) - uses is_current_user_admin()
-- "Admins can modify retailer requests" (ALL) - uses is_current_user_admin()  
-- "Public can submit retailer requests" (INSERT) - allows public form submissions

-- This ensures that:
-- 1. Only admins can read retailer application data
-- 2. Public users can still submit applications via the form
-- 3. Business contact information is protected from unauthorized access