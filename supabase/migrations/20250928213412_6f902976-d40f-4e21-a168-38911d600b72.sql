-- Add provinces support to flooring_brands and simplify email forwarding
ALTER TABLE public.flooring_brands 
ADD COLUMN provinces text[] DEFAULT '{"AB","BC","MB","NB","NL","NS","NT","NU","ON","PE","QC","SK","YT"}'::text[];

-- Simplify email forwarding - replace array with single email field
ALTER TABLE public.retailers 
DROP COLUMN IF EXISTS lead_forwarding_emails,
ADD COLUMN lead_forwarding_email text;