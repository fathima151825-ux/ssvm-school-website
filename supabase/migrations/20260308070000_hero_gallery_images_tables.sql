-- Create hero_images table to persist hero slider image URLs
CREATE TABLE IF NOT EXISTS public.hero_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  src TEXT NOT NULL,
  slot INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_hero_images_slot ON public.hero_images(slot);
CREATE INDEX IF NOT EXISTS idx_hero_images_sort ON public.hero_images(slot, sort_order);

ALTER TABLE public.hero_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "hero_images_public_read" ON public.hero_images;
CREATE POLICY "hero_images_public_read"
ON public.hero_images FOR SELECT
TO public
USING (true);

DROP POLICY IF EXISTS "hero_images_public_write" ON public.hero_images;
CREATE POLICY "hero_images_public_write"
ON public.hero_images FOR INSERT
TO public
WITH CHECK (true);

DROP POLICY IF EXISTS "hero_images_public_delete" ON public.hero_images;
CREATE POLICY "hero_images_public_delete"
ON public.hero_images FOR DELETE
TO public
USING (true);

-- Create gallery_images table to persist gallery image URLs
CREATE TABLE IF NOT EXISTS public.gallery_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id TEXT NOT NULL,
  src TEXT NOT NULL,
  alt TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_gallery_images_topic ON public.gallery_images(topic_id);

ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "gallery_images_public_read" ON public.gallery_images;
CREATE POLICY "gallery_images_public_read"
ON public.gallery_images FOR SELECT
TO public
USING (true);

DROP POLICY IF EXISTS "gallery_images_public_write" ON public.gallery_images;
CREATE POLICY "gallery_images_public_write"
ON public.gallery_images FOR INSERT
TO public
WITH CHECK (true);

DROP POLICY IF EXISTS "gallery_images_public_delete" ON public.gallery_images;
CREATE POLICY "gallery_images_public_delete"
ON public.gallery_images FOR DELETE
TO public
USING (true);
