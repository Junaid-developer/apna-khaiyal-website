-- =========================================================================
-- MIGRATION: PUBLIC CONTENT TABLES RLS PERMISSIONS & ANON READ PRIVILEGES
-- File: supabase/migrations/20260810_content_tables_public_rls.sql
-- =========================================================================

-- 1. Ensure table permissions for public content tables are explicitly granted to anon & authenticated roles
GRANT SELECT ON TABLE public.products TO anon, authenticated;
GRANT SELECT ON TABLE public.services TO anon, authenticated;
GRANT SELECT ON TABLE public.hero_slides TO anon, authenticated;
GRANT SELECT ON TABLE public.gallery TO anon, authenticated;
GRANT SELECT ON TABLE public.team_members TO anon, authenticated;
GRANT SELECT ON TABLE public.careers TO anon, authenticated;
GRANT SELECT ON TABLE public.job_applications TO anon, authenticated;
GRANT SELECT ON TABLE public.contact_messages TO anon, authenticated;
GRANT SELECT ON TABLE public.reviews TO anon, authenticated;

-- Also check if client_reviews table exists and grant if present
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'client_reviews') THEN
        EXECUTE 'GRANT SELECT ON TABLE public.client_reviews TO anon, authenticated';
    END IF;
END $$;

-- 2. Configure safe RLS SELECT policies for public content tables
-- products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read products" ON public.products;
CREATE POLICY "Allow public read products" ON public.products FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Allow authenticated write products" ON public.products;
CREATE POLICY "Allow authenticated write products" ON public.products FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- services
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read services" ON public.services;
CREATE POLICY "Allow public read services" ON public.services FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Allow authenticated write services" ON public.services;
CREATE POLICY "Allow authenticated write services" ON public.services FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- hero_slides
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read hero_slides" ON public.hero_slides;
CREATE POLICY "Allow public read hero_slides" ON public.hero_slides FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Allow authenticated write hero_slides" ON public.hero_slides;
CREATE POLICY "Allow authenticated write hero_slides" ON public.hero_slides FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- gallery
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read gallery" ON public.gallery;
CREATE POLICY "Allow public read gallery" ON public.gallery FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Allow authenticated write gallery" ON public.gallery;
CREATE POLICY "Allow authenticated write gallery" ON public.gallery FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- team_members
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read team_members" ON public.team_members;
CREATE POLICY "Allow public read team_members" ON public.team_members FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Allow authenticated write team_members" ON public.team_members;
CREATE POLICY "Allow authenticated write team_members" ON public.team_members FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- careers
ALTER TABLE public.careers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read careers" ON public.careers;
CREATE POLICY "Allow public read careers" ON public.careers FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Allow authenticated write careers" ON public.careers;
CREATE POLICY "Allow authenticated write careers" ON public.careers FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- job_applications
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read job_applications" ON public.job_applications;
CREATE POLICY "Allow public read job_applications" ON public.job_applications FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Allow authenticated write job_applications" ON public.job_applications;
CREATE POLICY "Allow authenticated write job_applications" ON public.job_applications FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- contact_messages
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read contact_messages" ON public.contact_messages;
CREATE POLICY "Allow public read contact_messages" ON public.contact_messages FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Allow authenticated write contact_messages" ON public.contact_messages;
CREATE POLICY "Allow authenticated write contact_messages" ON public.contact_messages FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read reviews" ON public.reviews;
CREATE POLICY "Allow public read reviews" ON public.reviews FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Allow authenticated write reviews" ON public.reviews;
CREATE POLICY "Allow authenticated write reviews" ON public.reviews FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3. Explicitly PROTECT Admin-related tables from public/anon access
-- Revoke all public/anon access on admin tables
REVOKE SELECT, INSERT, UPDATE, DELETE ON TABLE public.admins FROM anon;
REVOKE SELECT, INSERT, UPDATE, DELETE ON TABLE public.admin_roles FROM anon;

DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'roles') THEN
        EXECUTE 'REVOKE SELECT, INSERT, UPDATE, DELETE ON TABLE public.roles FROM anon';
    END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'permissions') THEN
        EXECUTE 'REVOKE SELECT, INSERT, UPDATE, DELETE ON TABLE public.permissions FROM anon';
    END IF;
END $$;

-- Configure RLS for admins table: ONLY accessible to authenticated users according to RBAC
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow read admins" ON public.admins;
DROP POLICY IF EXISTS "Allow public read admins" ON public.admins;
CREATE POLICY "Allow authenticated read admins" ON public.admins FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated write admins" ON public.admins FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Configure RLS for admin_roles table: ONLY accessible to authenticated users
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow read admin_roles" ON public.admin_roles;
CREATE POLICY "Allow authenticated read admin_roles" ON public.admin_roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated write admin_roles" ON public.admin_roles FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
