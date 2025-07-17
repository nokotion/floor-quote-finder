-- Completely reset the leads table RLS policies
DROP POLICY IF EXISTS "Allow public lead creation" ON public.leads;
DROP POLICY IF EXISTS "Admins can manage all leads" ON public.leads;
DROP POLICY IF EXISTS "Retailers can view assigned leads" ON public.leads;

-- Create simple, clear RLS policies
CREATE POLICY "Public can insert leads" 
ON public.leads 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can do everything" 
ON public.leads 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() AND role = 'admin'
));

CREATE POLICY "Retailers can view assigned leads" 
ON public.leads 
FOR SELECT 
USING (assigned_retailer_id IN (
  SELECT retailer_id FROM public.profiles 
  WHERE id = auth.uid() AND retailer_id IS NOT NULL
));

-- Ensure RLS is enabled
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;