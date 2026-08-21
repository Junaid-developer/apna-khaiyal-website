-- =========================================================================
-- MIGRATION: CROSS-DEVICE ADMIN RLS & USER ID MAPPING FIX
-- File: supabase/migrations/20260808_admin_cross_device_rls_fix.sql
-- =========================================================================

-- 1. Ensure admins, admin_roles, permissions, company_information tables exist
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT DEFAULT 'Admin',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.admin_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL,
    email TEXT NOT NULL,
    role TEXT DEFAULT 'admin',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Grant explicit table permissions
GRANT ALL ON TABLE public.admins TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.admin_roles TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.permissions TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.company_information TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.site_settings TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.website_settings TO anon, authenticated, service_role;

-- 3. Configure RLS Policies for admins
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read admins" ON public.admins;
CREATE POLICY "Allow read admins" ON public.admins FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Allow write admins" ON public.admins;
CREATE POLICY "Allow write admins" ON public.admins FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. Configure RLS Policies for admin_roles
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read admin_roles" ON public.admin_roles;
CREATE POLICY "Allow read admin_roles" ON public.admin_roles FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Allow write admin_roles" ON public.admin_roles;
CREATE POLICY "Allow write admin_roles" ON public.admin_roles FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 5. Configure RLS Policies for permissions
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read permissions" ON public.permissions;
CREATE POLICY "Allow read permissions" ON public.permissions FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Allow write permissions" ON public.permissions;
CREATE POLICY "Allow write permissions" ON public.permissions FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 6. Configure RLS Policies for company_information
ALTER TABLE public.company_information ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read company_information" ON public.company_information;
CREATE POLICY "Allow public read company_information" ON public.company_information FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Allow write company_information" ON public.company_information;
CREATE POLICY "Allow write company_information" ON public.company_information FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 7. Force PostgREST schema cache reload
NOTIFY pgrst, 'reload schema';
