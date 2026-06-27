-- Supabase Storage: public blog-images bucket for admin featured image uploads
-- Run: pnpm --filter @workspace/db run migrate:storage

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'blog-images',
  'blog-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/avif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Public read (featured images on the blog)
DROP POLICY IF EXISTS "Public read blog images" ON storage.objects;
CREATE POLICY "Public read blog images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'blog-images');

-- Authenticated users can upload (optional; API uses service role which bypasses RLS)
DROP POLICY IF EXISTS "Authenticated upload blog images" ON storage.objects;
CREATE POLICY "Authenticated upload blog images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'blog-images');

DROP POLICY IF EXISTS "Authenticated update blog images" ON storage.objects;
CREATE POLICY "Authenticated update blog images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'blog-images')
WITH CHECK (bucket_id = 'blog-images');

DROP POLICY IF EXISTS "Authenticated delete blog images" ON storage.objects;
CREATE POLICY "Authenticated delete blog images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'blog-images');
