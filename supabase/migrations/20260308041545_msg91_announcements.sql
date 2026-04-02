-- MSG91 Announcements Integration Migration
-- Creates: students_basic, announcements, bulk_contacts tables

-- ─────────────────────────────────────────────
-- 1. TABLES
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.students_basic (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name TEXT NOT NULL,
  class TEXT NOT NULL,
  section TEXT,
  parent_phone TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT,
  target_type TEXT NOT NULL DEFAULT 'all',
  target_classes TEXT[],
  target_sections TEXT[],
  custom_numbers TEXT[],
  delivery_method TEXT NOT NULL DEFAULT 'sms',
  number_count INTEGER DEFAULT 0,
  delivery_status TEXT NOT NULL DEFAULT 'pending',
  msg91_response JSONB,
  sent_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.bulk_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT NOT NULL,
  label TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_bulk_contacts_phone ON public.bulk_contacts (phone_number);

-- ─────────────────────────────────────────────
-- 2. INDEXES
-- ─────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_students_class ON public.students_basic (class);
CREATE INDEX IF NOT EXISTS idx_students_section ON public.students_basic (section);
CREATE INDEX IF NOT EXISTS idx_students_phone ON public.students_basic (parent_phone);
CREATE INDEX IF NOT EXISTS idx_announcements_sent_at ON public.announcements (sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_status ON public.announcements (delivery_status);

-- ─────────────────────────────────────────────
-- 3. ENABLE RLS
-- ─────────────────────────────────────────────

ALTER TABLE public.students_basic ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bulk_contacts ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────
-- 4. RLS POLICIES (open access for admin panel)
-- ─────────────────────────────────────────────

DROP POLICY IF EXISTS "open_access_students_basic" ON public.students_basic;
CREATE POLICY "open_access_students_basic"
  ON public.students_basic FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "open_access_announcements" ON public.announcements;
CREATE POLICY "open_access_announcements"
  ON public.announcements FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "open_access_bulk_contacts" ON public.bulk_contacts;
CREATE POLICY "open_access_bulk_contacts"
  ON public.bulk_contacts FOR ALL TO public USING (true) WITH CHECK (true);

-- ─────────────────────────────────────────────
-- 5. SAMPLE DATA
-- ─────────────────────────────────────────────

DO $$
BEGIN
  INSERT INTO public.students_basic (student_name, class, section, parent_phone) VALUES
    ('Arjun Rajan', '5', 'A', '9876543210'),
    ('Priya Venkat', '5', 'A', '9876543211'),
    ('Mohammed Farhan', '6', 'B', '9876543212'),
    ('Divya Krishnan', 'Nursery', 'A', '9876543213'),
    ('Rahul Sharma', '10', 'C', '9876543214'),
    ('Sneha Pillai', 'LKG', 'A', '9876543215'),
    ('Karthik Nair', '12', 'B', '9876543216'),
    ('Ananya Suresh', 'UKG', 'A', '9876543217')
  ON CONFLICT DO NOTHING;

  INSERT INTO public.announcements (title, message, target_type, delivery_method, number_count, delivery_status) VALUES
    ('Holiday Announcement - Holi', 'School will remain closed on Holi. Classes resume on Monday.', 'all', 'sms', 842, 'success'),
    ('Exam Schedule - Class X and XII', 'Board exam schedule has been released. Please check the school website.', 'classes', 'sms', 214, 'success'),
    ('Fee Reminder - March 2026', 'Kindly pay the March fees before 10th to avoid late charges.', 'custom', 'voice', 156, 'success')
  ON CONFLICT DO NOTHING;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Sample data insertion skipped: %', SQLERRM;
END $$;
