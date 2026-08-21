-- =========================================================================
-- MIGRATION: SYNC RBAC USERS & PERMISSIONS IN PUBLIC.ADMINS AND PUBLIC.ADMIN_ROLES
-- File: supabase/migrations/20260811_sync_rbac_users.sql
-- =========================================================================

-- 1. Ensure public.admins and public.admin_roles exist
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

-- 3. Configure RLS Policies for public.admins
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read admins" ON public.admins;
DROP POLICY IF EXISTS "Allow public read admins" ON public.admins;
DROP POLICY IF EXISTS "Allow authenticated read admins" ON public.admins;

CREATE POLICY "Allow authenticated read admins" ON public.admins 
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow write admins" ON public.admins;
DROP POLICY IF EXISTS "Allow authenticated write admins" ON public.admins;

CREATE POLICY "Allow authenticated write admins" ON public.admins 
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. Configure RLS Policies for public.admin_roles
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read admin_roles" ON public.admin_roles;
DROP POLICY IF EXISTS "Allow authenticated read admin_roles" ON public.admin_roles;

CREATE POLICY "Allow authenticated read admin_roles" ON public.admin_roles 
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow write admin_roles" ON public.admin_roles;
DROP POLICY IF EXISTS "Allow authenticated write admin_roles" ON public.admin_roles;

CREATE POLICY "Allow authenticated write admin_roles" ON public.admin_roles 
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 5. PL/pgSQL block to link auth.users to public.admins & public.admin_roles with correct roles
DO $$
DECLARE
    u RECORD;
    v_role TEXT;
    v_full_name TEXT;
BEGIN
    FOR u IN SELECT id, email, raw_user_meta_data FROM auth.users LOOP
        IF LOWER(u.email) = 'junaidrana80@gmail.com' THEN
            v_role := 'HR';
        ELSIF LOWER(u.email) = 'junaidrana630@gmail.com' THEN
            v_role := 'Admin';
        ELSIF LOWER(u.email) = 'support@apnakhaiyal.com' OR LOWER(u.email) = 'support@apnakhiyal.com' THEN
            v_role := 'Admin';
        ELSE
            v_role := 'Admin';
        END IF;

        v_full_name := COALESCE(
            u.raw_user_meta_data->>'full_name',
            u.raw_user_meta_data->>'name',
            SPLIT_PART(u.email, '@', 1),
            'Administrator'
        );

        -- Upsert into public.admins
        INSERT INTO public.admins (user_id, email, full_name, role, is_active, created_at, updated_at)
        VALUES (
            u.id,
            LOWER(u.email),
            v_full_name,
            v_role,
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (email) DO UPDATE SET
            user_id = EXCLUDED.user_id,
            full_name = COALESCE(public.admins.full_name, EXCLUDED.full_name),
            role = v_role,
            is_active = true,
            updated_at = NOW();

        -- Upsert into public.admin_roles
        INSERT INTO public.admin_roles (user_id, email, role, created_at)
        VALUES (
            u.id,
            LOWER(u.email),
            LOWER(v_role),
            NOW()
        )
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            role = LOWER(v_role);
    END LOOP;
END $$;

-- 6. Seed fallback entries for the 3 required users if not inserted from auth.users yet
INSERT INTO public.admins (email, full_name, role, is_active, created_at, updated_at)
VALUES
    ('junaidrana630@gmail.com', 'Junaid Rana', 'Admin', true, NOW(), NOW()),
    ('junaidrana80@gmail.com', 'Junaid Rana (HR)', 'HR', true, NOW(), NOW()),
    ('support@apnakhaiyal.com', 'Support Admin', 'Admin', true, NOW(), NOW())
ON CONFLICT (email) DO UPDATE SET
    role = EXCLUDED.role,
    is_active = true,
    updated_at = NOW();

-- 7. Force PostgREST schema cache reload
NOTIFY pgrst, 'reload schema';
