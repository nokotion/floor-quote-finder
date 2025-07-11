-- Update the leads status check constraint to include verification statuses
ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_status_check;

-- Create new constraint that includes verification statuses
ALTER TABLE public.leads ADD CONSTRAINT leads_status_check 
  CHECK (status = ANY (ARRAY[
    'new'::text, 
    'pending_verification'::text, 
    'verified'::text, 
    'assigned'::text, 
    'contacted'::text, 
    'quoted'::text, 
    'won'::text, 
    'lost'::text
  ]));