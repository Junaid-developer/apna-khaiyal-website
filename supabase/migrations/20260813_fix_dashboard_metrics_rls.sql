-- =========================================================================
-- MIGRATION: PUBLIC CONTENT TABLES RLS PERMISSIONS & DASHBOARD METRICS FIX
-- File: supabase/migrations/20260813_fix_dashboard_metrics_rls.sql
-- =========================================================================

-- 1. Grant explicit SELECT table privileges on public content tables to anon, authenticated, and service_role
GRANT SELECT ON TABLE public.products TO anon, authenticated, service_role;
GRANT SELECT ON TABLE public.services TO anon, authenticated, service_role;
GRANT SELECT ON TABLE public.hero_slides TO anon, authenticated, service_role;
GRANT SELECT ON TABLE public.gallery TO anon, authenticated, service_role;
GRANT SELECT ON TABLE public.team_members TO anon, authenticated, service_role;
GRANT SELECT ON TABLE public.careers TO anon, authenticated, service_role;
GRANT SELECT ON TABLE public.job_applications TO anon, authenticated, service_role;
GRANT SELECT ON TABLE public.contact_messages TO anon, authenticated, service_role;
GRANT SELECT ON TABLE public.reviews TO anon, authenticated, service_role;

DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'team') THEN
        EXECUTE 'GRANT SELECT ON TABLE public.team TO anon, authenticated, service_role';
    END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'client_reviews') THEN
        EXECUTE 'GRANT SELECT ON TABLE public.client_reviews TO anon, authenticated, service_role';
    END IF;
END $$;

-- 2. Configure safe SELECT RLS Policies for Public Content Tables
-- products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read products" ON public.products;
DROP POLICY IF EXISTS "Allow public select products" ON public.products;
CREATE POLICY "Allow public select products" ON public.products FOR SELECT TO anon, authenticated USING (true);

-- services
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read services" ON public.services;
DROP POLICY IF EXISTS "Allow public select services" ON public.services;
CREATE POLICY "Allow public select services" ON public.services FOR SELECT TO anon, authenticated USING (true);

-- hero_slides
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read hero_slides" ON public.hero_slides;
DROP POLICY IF EXISTS "Allow public select hero_slides" ON public.hero_slides;
CREATE POLICY "Allow public select hero_slides" ON public.hero_slides FOR SELECT TO anon, authenticated USING (true);

-- gallery
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read gallery" ON public.gallery;
DROP POLICY IF EXISTS "Allow public select gallery" ON public.gallery;
CREATE POLICY "Allow public select gallery" ON public.gallery FOR SELECT TO anon, authenticated USING (true);

-- team_members
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read team_members" ON public.team_members;
DROP POLICY IF EXISTS "Allow public select team_members" ON public.team_members;
CREATE POLICY "Allow public select team_members" ON public.team_members FOR SELECT TO anon, authenticated USING (true);

-- team (if present)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'team') THEN
        EXECUTE 'ALTER TABLE public.team ENABLE ROW LEVEL SECURITY';
        EXECUTE 'DROP POLICY IF EXISTS "Allow public select team" ON public.team';
        EXECUTE 'CREATE POLICY "Allow public select team" ON public.team FOR SELECT TO anon, authenticated USING (true)';
    END IF;
END $$;

-- careers
ALTER TABLE public.careers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read careers" ON public.careers;
DROP POLICY IF EXISTS "Allow public select careers" ON public.careers;
CREATE POLICY "Allow public select careers" ON public.careers FOR SELECT TO anon, authenticated USING (true);

-- job_applications
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read job_applications" ON public.job_applications;
DROP POLICY IF EXISTS "Allow public select job_applications" ON public.job_applications;
DROP POLICY IF EXISTS "Staff select job_applications" ON public.job_applications;
CREATE POLICY "Allow public select job_applications" ON public.job_applications FOR SELECT TO anon, authenticated USING (true);

-- contact_messages
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read contact_messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Allow public select contact_messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Staff select contact_messages" ON public.contact_messages;
CREATE POLICY "Allow public select contact_messages" ON public.contact_messages FOR SELECT TO anon, authenticated USING (true);

-- reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read reviews" ON public.reviews;
DROP POLICY IF EXISTS "Allow public select reviews" ON public.reviews;
CREATE POLICY "Allow public select reviews" ON public.reviews FOR SELECT TO anon, authenticated USING (true);

-- client_reviews (if present)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'client_reviews') THEN
        EXECUTE 'ALTER TABLE public.client_reviews ENABLE ROW LEVEL SECURITY';
        EXECUTE 'DROP POLICY IF EXISTS "Allow public select client_reviews" ON public.client_reviews';
        EXECUTE 'CREATE POLICY "Allow public select client_reviews" ON public.client_reviews FOR SELECT TO anon, authenticated USING (true)';
    END IF;
END $$;

-- 3. EXPLICITLY PROTECT Admin-related tables from public/anon access
REVOKE ALL ON TABLE public.admins FROM anon;
REVOKE ALL ON TABLE public.admin_roles FROM anon;

DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'roles') THEN
        EXECUTE 'REVOKE ALL ON TABLE public.roles FROM anon';
    END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'permissions') THEN
        EXECUTE 'REVOKE ALL ON TABLE public.permissions FROM anon';
    END IF;
END $$;

-- Enable RLS and create policy on admins table ONLY for authenticated users
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read admins" ON public.admins;
DROP POLICY IF EXISTS "Allow read admins" ON public.admins;
DROP POLICY IF EXISTS "Allow authenticated read admins" ON public.admins;

CREATE POLICY "Allow authenticated read admins" ON public.admins 
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated write admins" ON public.admins;
CREATE POLICY "Allow authenticated write admins" ON public.admins 
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Enable RLS and create policy on admin_roles table ONLY for authenticated users
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read admin_roles" ON public.admin_roles;
DROP POLICY IF EXISTS "Allow read admin_roles" ON public.admin_roles;
DROP POLICY IF EXISTS "Allow authenticated read admin_roles" ON public.admin_roles;

CREATE POLICY "Allow authenticated read admin_roles" ON public.admin_roles 
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated write admin_roles" ON public.admin_roles;
CREATE POLICY "Allow authenticated write admin_roles" ON public.admin_roles 
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. Notify schema cache reload
NOTIFY pgrst, 'reload schema';
