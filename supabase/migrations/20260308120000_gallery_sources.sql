-- Gallery Sources: stores Google Drive folder links for each gallery section
-- Timestamp: 20260308120000 (higher than existing 20260308090000)

CREATE TABLE IF NOT EXISTS public.gallery_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_name TEXT UNIQUE NOT NULL,
  drive_folder_link TEXT DEFAULT '',
  max_images INTEGER DEFAULT 25,
  auto_slide_seconds INTEGER DEFAULT 3,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gallery_sources_section_name ON public.gallery_sources(section_name);

ALTER TABLE public.gallery_sources ENABLE ROW LEVEL SECURITY;

-- Public can read all gallery sources
DROP POLICY IF EXISTS "gallery_sources_public_select" ON public.gallery_sources;
CREATE POLICY "gallery_sources_public_select"
  ON public.gallery_sources
  FOR SELECT
  TO public
  USING (true);

-- Authenticated users can insert
DROP POLICY IF EXISTS "gallery_sources_auth_insert" ON public.gallery_sources;
CREATE POLICY "gallery_sources_auth_insert"
  ON public.gallery_sources
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Authenticated users can update
DROP POLICY IF EXISTS "gallery_sources_auth_update" ON public.gallery_sources;
CREATE POLICY "gallery_sources_auth_update"
  ON public.gallery_sources
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Seed all 12 sections
INSERT INTO public.gallery_sources (section_name, drive_folder_link, max_images, auto_slide_seconds)
VALUES
  ('hero_slider',       '', 25, 3),
  ('correspondent',     '', 25, 3),
  ('principal',         '', 25, 3),
  ('campus',            '', 25, 3),
  ('teachers',          '', 25, 3),
  ('admins',            '', 25, 3),
  ('supporting_staff',  '', 25, 3),
  ('sports_events',     '', 25, 3),
  ('cultural_events',   '', 25, 3),
  ('tours',             '', 25, 3),
  ('toppers',           '', 25, 3),
  ('hall_of_fame',      '', 25, 3)
ON CONFLICT (section_name) DO NOTHING;
