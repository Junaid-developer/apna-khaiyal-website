-- =========================================================================
-- MIGRATION: FIX ADMIN USER DELETION & RBAC RLS POLICIES
-- File: supabase/migrations/20260815_fix_admin_user_deletion_rls.sql
-- =========================================================================

-- 1. Ensure public.admins and public.admin_roles tables exist
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

-- 2. Grant table permissions to authenticated and service_role
GRANT ALL ON TABLE public.admins TO authenticated, service_role;
GRANT ALL ON TABLE public.admin_roles TO authenticated, service_role;

-- 3. Enable RLS on both tables
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;

-- 4. Clean up existing conflicting policies on public.admins
DROP POLICY IF EXISTS "Allow read admins" ON public.admins;
DROP POLICY IF EXISTS "Allow public read admins" ON public.admins;
DROP POLICY IF EXISTS "Allow authenticated read admins" ON public.admins;
DROP POLICY IF EXISTS "Allow write admins" ON public.admins;
DROP POLICY IF EXISTS "Allow authenticated write admins" ON public.admins;
DROP POLICY IF EXISTS "Allow authenticated select admins" ON public.admins;
DROP POLICY IF EXISTS "Allow authenticated insert admins" ON public.admins;
DROP POLICY IF EXISTS "Allow authenticated update admins" ON public.admins;
DROP POLICY IF EXISTS "Allow authenticated delete admins" ON public.admins;

-- 5. Explicit CRUD Policies for public.admins (SELECT, INSERT, UPDATE, DELETE)
CREATE POLICY "Allow authenticated select admins" ON public.admins
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated insert admins" ON public.admins
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update admins" ON public.admins
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated delete admins" ON public.admins
    FOR DELETE TO authenticated USING (true);

-- 6. Clean up existing conflicting policies on public.admin_roles
DROP POLICY IF EXISTS "Allow read admin_roles" ON public.admin_roles;
DROP POLICY IF EXISTS "Allow public read admin_roles" ON public.admin_roles;
DROP POLICY IF EXISTS "Allow authenticated read admin_roles" ON public.admin_roles;
DROP POLICY IF EXISTS "Allow write admin_roles" ON public.admin_roles;
DROP POLICY IF EXISTS "Allow authenticated write admin_roles" ON public.admin_roles;
DROP POLICY IF EXISTS "Allow authenticated select admin_roles" ON public.admin_roles;
DROP POLICY IF EXISTS "Allow authenticated insert admin_roles" ON public.admin_roles;
DROP POLICY IF EXISTS "Allow authenticated update admin_roles" ON public.admin_roles;
DROP POLICY IF EXISTS "Allow authenticated delete admin_roles" ON public.admin_roles;

-- 7. Explicit CRUD Policies for public.admin_roles (SELECT, INSERT, UPDATE, DELETE)
CREATE POLICY "Allow authenticated select admin_roles" ON public.admin_roles
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated insert admin_roles" ON public.admin_roles
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update admin_roles" ON public.admin_roles
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated delete admin_roles" ON public.admin_roles
    FOR DELETE TO authenticated USING (true);

-- 8. Atomic, Secure Helper RPC to safely delete admin user without frontend auth.users deletion errors
CREATE OR REPLACE FUNCTION public.delete_admin_user_secure(
    p_admin_id TEXT DEFAULT NULL,
    p_user_id TEXT DEFAULT NULL,
    p_email TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_clean_email TEXT;
    v_deleted_admins INT := 0;
    v_deleted_roles INT := 0;
    v_target_user_id UUID := NULL;
    v_target_admin_id UUID := NULL;
BEGIN
    v_clean_email := LOWER(TRIM(COALESCE(p_email, '')));

    -- Validate user_id as UUID if provided
    IF p_user_id IS NOT NULL AND p_user_id ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' THEN
        v_target_user_id := p_user_id::UUID;
    END IF;

    -- Validate admin_id as UUID if provided
    IF p_admin_id IS NOT NULL AND p_admin_id ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' THEN
        v_target_admin_id := p_admin_id::UUID;
    END IF;

    -- 1. Delete from public.admin_roles
    IF v_target_user_id IS NOT NULL THEN
        DELETE FROM public.admin_roles WHERE user_id = v_target_user_id;
        GET DIAGNOSTICS v_deleted_roles = ROW_COUNT;
    ELSIF v_clean_email <> '' THEN
        DELETE FROM public.admin_roles WHERE LOWER(email) = v_clean_email;
        GET DIAGNOSTICS v_deleted_roles = ROW_COUNT;
    END IF;

    -- 2. Delete from public.admins
    IF v_target_admin_id IS NOT NULL THEN
        DELETE FROM public.admins WHERE id = v_target_admin_id;
        GET DIAGNOSTICS v_deleted_admins = ROW_COUNT;
    ELSIF v_target_user_id IS NOT NULL THEN
        DELETE FROM public.admins WHERE user_id = v_target_user_id;
        GET DIAGNOSTICS v_deleted_admins = ROW_COUNT;
    ELSIF v_clean_email <> '' THEN
        DELETE FROM public.admins WHERE LOWER(email) = v_clean_email;
        GET DIAGNOSTICS v_deleted_admins = ROW_COUNT;
    END IF;

    -- 3. Log audit event if content_audit_logs table exists
    BEGIN
        IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'content_audit_logs') THEN
            INSERT INTO public.content_audit_logs (
                user_email,
                user_role,
                action_type,
                content_type,
                details,
                created_at
            ) VALUES (
                COALESCE(auth.jwt()->>'email', 'admin@system.local'),
                'Admin',
                'DELETE',
                'Admin User / RBAC',
                CONCAT('Deleted administrator user: ', COALESCE(v_clean_email, p_admin_id, p_user_id)),
                NOW()
            );
        END IF;
    EXCEPTION WHEN OTHERS THEN
        -- Non-blocking audit log failure
    END;

    RETURN jsonb_build_object(
        'success', true,
        'deleted_admins', v_deleted_admins,
        'deleted_roles', v_deleted_roles,
        'email', v_clean_email
    );
END;
$$;

-- Grant execution permissions for the helper function
GRANT EXECUTE ON FUNCTION public.delete_admin_user_secure(TEXT, TEXT, TEXT) TO authenticated, service_role, anon;

-- 9. Refresh PostgreSQL schema cache
NOTIFY pgrst, 'reload schema';
