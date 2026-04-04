-- Create images storage bucket for hero slider and gallery uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'images',
  'images',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access
DROP POLICY IF EXISTS "images_public_read" ON storage.objects;
CREATE POLICY "images_public_read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'images');

-- Allow authenticated users to upload
DROP POLICY IF EXISTS "images_authenticated_upload" ON storage.objects;
CREATE POLICY "images_authenticated_upload"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'images');

-- Allow authenticated users to delete their uploads
DROP POLICY IF EXISTS "images_authenticated_delete" ON storage.objects;
CREATE POLICY "images_authenticated_delete"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'images');
