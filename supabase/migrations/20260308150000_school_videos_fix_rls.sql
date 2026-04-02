-- school_videos table + fix gallery_sources RLS for anon admin
-- Timestamp: 20260308150000

-- ─── school_videos table ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.school_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  youtube_url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_school_videos_sort_order ON public.school_videos(sort_order);

ALTER TABLE public.school_videos ENABLE ROW LEVEL SECURITY;

-- Public (anon) can read all videos
DROP POLICY IF EXISTS "school_videos_public_select" ON public.school_videos;
CREATE POLICY "school_videos_public_select"
  ON public.school_videos
  FOR SELECT
  TO public
  USING (true);

-- Public (anon) can insert videos (admin panel uses fake auth = anon role)
DROP POLICY IF EXISTS "school_videos_public_insert" ON public.school_videos;
CREATE POLICY "school_videos_public_insert"
  ON public.school_videos
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Public (anon) can update videos
DROP POLICY IF EXISTS "school_videos_public_update" ON public.school_videos;
CREATE POLICY "school_videos_public_update"
  ON public.school_videos
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Public (anon) can delete videos
DROP POLICY IF EXISTS "school_videos_public_delete" ON public.school_videos;
CREATE POLICY "school_videos_public_delete"
  ON public.school_videos
  FOR DELETE
  TO public
  USING (true);

-- ─── Fix gallery_sources RLS: allow anon to upsert ─────────────────────────
-- The admin panel uses a fake login (no real Supabase auth), so the user is
-- anon role. The existing INSERT/UPDATE policies only allow 'authenticated'.
-- Replace them with public policies so saves actually work.

DROP POLICY IF EXISTS "gallery_sources_auth_insert" ON public.gallery_sources;
DROP POLICY IF EXISTS "gallery_sources_public_insert" ON public.gallery_sources;
CREATE POLICY "gallery_sources_public_insert"
  ON public.gallery_sources
  FOR INSERT
  TO public
  WITH CHECK (true);

DROP POLICY IF EXISTS "gallery_sources_auth_update" ON public.gallery_sources;
DROP POLICY IF EXISTS "gallery_sources_public_update" ON public.gallery_sources;
CREATE POLICY "gallery_sources_public_update"
  ON public.gallery_sources
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Also fix hero_images and gallery_images RLS for same reason
DROP POLICY IF EXISTS "hero_images_auth_insert" ON public.hero_images;
DROP POLICY IF EXISTS "hero_images_insert" ON public.hero_images;
DROP POLICY IF EXISTS "hero_images_public_insert" ON public.hero_images;
CREATE POLICY "hero_images_public_insert"
  ON public.hero_images
  FOR INSERT
  TO public
  WITH CHECK (true);

DROP POLICY IF EXISTS "hero_images_auth_update" ON public.hero_images;
DROP POLICY IF EXISTS "hero_images_update" ON public.hero_images;
DROP POLICY IF EXISTS "hero_images_public_update" ON public.hero_images;
CREATE POLICY "hero_images_public_update"
  ON public.hero_images
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "hero_images_auth_delete" ON public.hero_images;
DROP POLICY IF EXISTS "hero_images_delete" ON public.hero_images;
DROP POLICY IF EXISTS "hero_images_public_delete" ON public.hero_images;
CREATE POLICY "hero_images_public_delete"
  ON public.hero_images
  FOR DELETE
  TO public
  USING (true);

DROP POLICY IF EXISTS "gallery_images_auth_insert" ON public.gallery_images;
DROP POLICY IF EXISTS "gallery_images_insert" ON public.gallery_images;
DROP POLICY IF EXISTS "gallery_images_public_insert" ON public.gallery_images;
CREATE POLICY "gallery_images_public_insert"
  ON public.gallery_images
  FOR INSERT
  TO public
  WITH CHECK (true);

DROP POLICY IF EXISTS "gallery_images_auth_update" ON public.gallery_images;
DROP POLICY IF EXISTS "gallery_images_update" ON public.gallery_images;
DROP POLICY IF EXISTS "gallery_images_public_update" ON public.gallery_images;
CREATE POLICY "gallery_images_public_update"
  ON public.gallery_images
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "gallery_images_auth_delete" ON public.gallery_images;
DROP POLICY IF EXISTS "gallery_images_delete" ON public.gallery_images;
DROP POLICY IF EXISTS "gallery_images_public_delete" ON public.gallery_images;
CREATE POLICY "gallery_images_public_delete"
  ON public.gallery_images
  FOR DELETE
  TO public
  USING (true);
