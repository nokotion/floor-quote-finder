
-- Add missing address columns to leads table
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS address_city text,
ADD COLUMN IF NOT EXISTS address_province text,
ADD COLUMN IF NOT EXISTS address_formatted text;
