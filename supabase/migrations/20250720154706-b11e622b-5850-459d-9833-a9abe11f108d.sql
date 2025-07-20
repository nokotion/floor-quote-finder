
-- Add missing installation_required field to leads table
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS installation_required boolean DEFAULT false;

-- Drop existing restrictive RLS policy that's causing the insert error
DROP POLICY IF EXISTS "Allow public lead creation" ON public.leads;
DROP POLICY IF EXISTS "Allow public lead submissions" ON public.leads;

-- Create new RLS policy that allows both unverified and verified lead creation
CREATE POLICY "Allow lead submissions with verification status" 
ON public.leads 
FOR INSERT 
WITH CHECK (
  customer_name IS NOT NULL 
  AND customer_email IS NOT NULL 
  AND postal_code IS NOT NULL 
  AND (
    -- Allow unverified leads for the verification process
    (status = 'pending_verification' AND is_verified = false)
    OR 
    -- Allow verified leads after verification completes
    (status = 'verified' AND is_verified = true)
  )
);

-- Create index for better performance on lead distribution queries
CREATE INDEX IF NOT EXISTS idx_leads_postal_brand_verified 
ON public.leads(postal_code, brand_requested, is_verified) 
WHERE is_verified = true;

-- Create index for retailer matching on brand subscriptions
CREATE INDEX IF NOT EXISTS idx_brand_subscriptions_active 
ON public.brand_subscriptions(brand_name, retailer_id) 
WHERE is_active = true;
