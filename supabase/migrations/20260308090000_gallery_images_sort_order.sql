-- Add sort_order column to gallery_images table
ALTER TABLE public.gallery_images
ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_gallery_images_sort ON public.gallery_images(topic_id, sort_order);

-- Add UPDATE policy for hero_images (needed for drag-and-drop reorder)
DROP POLICY IF EXISTS "hero_images_public_update" ON public.hero_images;
CREATE POLICY "hero_images_public_update"
ON public.hero_images FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

-- Add UPDATE policy for gallery_images (needed for drag-and-drop reorder)
DROP POLICY IF EXISTS "gallery_images_public_update" ON public.gallery_images;
CREATE POLICY "gallery_images_public_update"
ON public.gallery_images FOR UPDATE
TO public
USING (true)
WITH CHECK (true);
