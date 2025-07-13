-- Create storage policies for pricemyfloor-files bucket to allow file uploads

-- Policy to allow public insertion of files (for lead attachments)
CREATE POLICY "Allow public uploads to lead attachments" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'pricemyfloor-files');

-- Policy to allow public reading of files
CREATE POLICY "Allow public reading of lead attachments" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'pricemyfloor-files');

-- Policy to allow public updates (if needed for metadata)
CREATE POLICY "Allow public updates to lead attachments" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'pricemyfloor-files');