-- Create retailer_lead_credits table to track lead credits
CREATE TABLE IF NOT EXISTS public.retailer_lead_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  retailer_id UUID REFERENCES public.retailers(id) ON DELETE CASCADE,
  credits_remaining INTEGER NOT NULL DEFAULT 0,
  credits_used INTEGER NOT NULL DEFAULT 0,
  last_purchase_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.retailer_lead_credits ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Retailers can view their own credits" ON public.retailer_lead_credits
  FOR SELECT
  USING (retailer_id IN (
    SELECT profiles.retailer_id
    FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.retailer_id IS NOT NULL
  ));

CREATE POLICY "Admins can manage all credits" ON public.retailer_lead_credits
  FOR ALL
  USING (is_admin_user());

CREATE POLICY "Service role can manage credits" ON public.retailer_lead_credits
  FOR ALL
  USING (true);

-- Add indexes for performance
CREATE INDEX idx_retailer_lead_credits_retailer_id ON public.retailer_lead_credits(retailer_id);

-- Create trigger for updated_at
CREATE TRIGGER update_retailer_lead_credits_updated_at
  BEFORE UPDATE ON public.retailer_lead_credits
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Add missing columns to lead_distributions table for better tracking
ALTER TABLE public.lead_distributions 
ADD COLUMN IF NOT EXISTS delivery_time TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS was_paid BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS payment_method TEXT CHECK (payment_method IN ('credit', 'stripe', 'free')),
ADD COLUMN IF NOT EXISTS charge_amount NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;

-- Add postal code matching and preferences to retailers table if not exists
ALTER TABLE public.retailers 
ADD COLUMN IF NOT EXISTS postal_code_prefixes TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS installation_preference TEXT CHECK (installation_preference IN ('both', 'supply_only', 'supply_and_install')) DEFAULT 'both',
ADD COLUMN IF NOT EXISTS urgency_preference TEXT CHECK (urgency_preference IN ('any', 'asap_only', 'flexible')) DEFAULT 'any';

-- Update brand_subscriptions to include square footage tiers
ALTER TABLE public.brand_subscriptions
ADD COLUMN IF NOT EXISTS sqft_tier_min INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS sqft_tier_max INTEGER DEFAULT 999999;