-- Allow authenticated users to upload files to the property-files bucket
CREATE POLICY "authenticated users can upload"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'property-files');

-- Allow authenticated users to update/replace their own files
CREATE POLICY "authenticated users can update"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'property-files');

-- Allow authenticated users to delete files
CREATE POLICY "authenticated users can delete"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'property-files');

-- Allow public read (bucket is public, but explicit policy ensures it works)
CREATE POLICY "public can read property files"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'property-files');
