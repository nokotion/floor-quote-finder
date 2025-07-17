-- Update the default value of the status column in the leads table
ALTER TABLE public.leads 
ALTER COLUMN status SET DEFAULT 'pending_verification';

-- Ensure RLS is enabled for the leads table
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;