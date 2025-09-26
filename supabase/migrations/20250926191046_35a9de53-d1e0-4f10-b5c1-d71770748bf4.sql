-- Add product_details column to leads table for customer product specifications
ALTER TABLE public.leads 
ADD COLUMN product_details text;