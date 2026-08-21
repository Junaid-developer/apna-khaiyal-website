-- =========================================================================
-- MIGRATION: STRICT ROLE-BASED ACCESS CONTROL (RBAC) FOR ADMIN AND HR
-- File: supabase/migrations/20260812_strict_rbac_policies.sql
-- =========================================================================

-- 1. Ensure permissions table exists
CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  role VARCHAR(50) NOT NULL,
  module VARCHAR(50) NOT NULL,
  can_read BOOLEAN DEFAULT true,
  can_write BOOLEAN DEFAULT false,
  can_delete BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_role_module UNIQUE (role, module)
);

-- Enable RLS on permissions
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Permissions" ON public.permissions;
CREATE POLICY "Public Read Permissions" ON public.permissions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated Write Permissions" ON public.permissions;
CREATE POLICY "Authenticated Write Permissions" ON public.permissions FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 2. Seed Admin Permissions (Full Read, Write, Delete across all modules)
INSERT INTO public.permissions (role, module, can_read, can_write, can_delete) VALUES
('Admin', 'dashboard', true, true, true),
('Admin', 'users-management', true, true, true),
('Admin', 'security', true, true, true),
('Admin', 'products', true, true, true),
('Admin', 'services', true, true, true),
('Admin', 'process', true, true, true),
('Admin', 'industries', true, true, true),
('Admin', 'techstack', true, true, true),
('Admin', 'team', true, true, true),
('Admin', 'gallery', true, true, true),
('Admin', 'reviews', true, true, true),
('Admin', 'careers', true, true, true),
('Admin', 'hero-slider', true, true, true),
('Admin', 'hero-about', true, true, true),
('Admin', 'messages', true, true, true),
('Admin', 'footer-settings', true, true, true),
('Admin', 'settings-seo', true, true, true),
('Admin', 'branding', true, true, true),
('Admin', 'company-contact', true, true, true)
ON CONFLICT (role, module) DO UPDATE SET
  can_read = true,
  can_write = true,
  can_delete = true,
  updated_at = NOW();

-- 3. Seed HR Permissions (Restricted: Careers, Applications, Messages, SEO view, Profile)
INSERT INTO public.permissions (role, module, can_read, can_write, can_delete) VALUES
('HR', 'dashboard', true, false, false),
('HR', 'careers', true, true, false),
('HR', 'job_applications', true, true, false),
('HR', 'messages', true, true, false),
('HR', 'seo', true, false, false),
('HR', 'security', true, true, false),
('HR', 'users-management', false, false, false),
('HR', 'products', false, false, false),
('HR', 'services', false, false, false),
('HR', 'process', false, false, false),
('HR', 'industries', false, false, false),
('HR', 'techstack', false, false, false),
('HR', 'team', false, false, false),
('HR', 'gallery', false, false, false),
('HR', 'reviews', false, false, false),
('HR', 'hero-slider', false, false, false),
('HR', 'hero-about', false, false, false),
('HR', 'footer-settings', false, false, false),
('HR', 'branding', false, false, false),
('HR', 'company-contact', false, false, false)
ON CONFLICT (role, module) DO UPDATE SET
  can_read = EXCLUDED.can_read,
  can_write = EXCLUDED.can_write,
  can_delete = EXCLUDED.can_delete,
  updated_at = NOW();

-- 4. Table RLS Policies for HR vs Admin Security Enforcement
-- Helper function to check if current authenticated user has Admin role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  v_role TEXT;
BEGIN
  SELECT role INTO v_role
  FROM public.admins
  WHERE user_id = auth.uid()
  LIMIT 1;

  IF v_role IS NULL THEN
    SELECT role INTO v_role
    FROM public.admins
    WHERE LOWER(email) = LOWER(auth.jwt()->>'email')
    LIMIT 1;
  END IF;

  RETURN (LOWER(COALESCE(v_role, '')) = 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is HR or Admin
CREATE OR REPLACE FUNCTION public.is_authorized_staff()
RETURNS BOOLEAN AS $$
DECLARE
  v_role TEXT;
BEGIN
  SELECT role INTO v_role
  FROM public.admins
  WHERE user_id = auth.uid()
  LIMIT 1;

  IF v_role IS NULL THEN
    SELECT role INTO v_role
    FROM public.admins
    WHERE LOWER(email) = LOWER(auth.jwt()->>'email')
    LIMIT 1;
  END IF;

  RETURN (LOWER(COALESCE(v_role, '')) IN ('admin', 'hr'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Configure RLS for careers, job_applications, contact_messages
ALTER TABLE public.careers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Careers RLS
DROP POLICY IF EXISTS "Public read careers" ON public.careers;
CREATE POLICY "Public read careers" ON public.careers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Staff write careers" ON public.careers;
CREATE POLICY "Staff write careers" ON public.careers FOR INSERT WITH CHECK (public.is_authorized_staff());

DROP POLICY IF EXISTS "Staff update careers" ON public.careers;
CREATE POLICY "Staff update careers" ON public.careers FOR UPDATE USING (public.is_authorized_staff()) WITH CHECK (public.is_authorized_staff());

DROP POLICY IF EXISTS "Admin delete careers" ON public.careers;
CREATE POLICY "Admin delete careers" ON public.careers FOR DELETE USING (public.is_admin());

-- Job Applications RLS
DROP POLICY IF EXISTS "Public insert job_applications" ON public.job_applications;
CREATE POLICY "Public insert job_applications" ON public.job_applications FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Staff select job_applications" ON public.job_applications;
CREATE POLICY "Staff select job_applications" ON public.job_applications FOR SELECT USING (public.is_authorized_staff());

DROP POLICY IF EXISTS "Staff update job_applications" ON public.job_applications;
CREATE POLICY "Staff update job_applications" ON public.job_applications FOR UPDATE USING (public.is_authorized_staff()) WITH CHECK (public.is_authorized_staff());

DROP POLICY IF EXISTS "Admin delete job_applications" ON public.job_applications;
CREATE POLICY "Admin delete job_applications" ON public.job_applications FOR DELETE USING (public.is_admin());

-- Contact Messages RLS
DROP POLICY IF EXISTS "Public insert contact_messages" ON public.contact_messages;
CREATE POLICY "Public insert contact_messages" ON public.contact_messages FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Staff select contact_messages" ON public.contact_messages;
CREATE POLICY "Staff select contact_messages" ON public.contact_messages FOR SELECT USING (public.is_authorized_staff());

DROP POLICY IF EXISTS "Staff update contact_messages" ON public.contact_messages;
CREATE POLICY "Staff update contact_messages" ON public.contact_messages FOR UPDATE USING (public.is_authorized_staff()) WITH CHECK (public.is_authorized_staff());

DROP POLICY IF EXISTS "Admin delete contact_messages" ON public.contact_messages;
CREATE POLICY "Admin delete contact_messages" ON public.contact_messages FOR DELETE USING (public.is_admin());

-- Notify schema reload
NOTIFY pgrst, 'reload schema';
