-- =========================================================================
-- SUPABASE MIGRATION: ROLE-BASED ACCESS CONTROL (RBAC) SYSTEM
-- Creates permissions table, default role permissions, and RLS policies
-- =========================================================================

-- 1. Create permissions table for custom module permissions
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

-- Enable RLS on permissions table
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;

-- Create policy allowing authenticated users to read permissions and Super Admins to edit
DROP POLICY IF EXISTS "Public Read Permissions" ON public.permissions;
CREATE POLICY "Public Read Permissions" ON public.permissions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin Full Access Permissions" ON public.permissions;
CREATE POLICY "Admin Full Access Permissions" ON public.permissions FOR ALL USING (auth.role() = 'authenticated');

-- 2. Seed default permissions for Super Admin, Admin, and Editor
INSERT INTO public.permissions (role, module, can_read, can_write, can_delete) VALUES
-- Super Admin (Full access to all modules and user management)
('Super Admin', 'dashboard', true, true, true),
('Super Admin', 'users-management', true, true, true),
('Super Admin', 'security', true, true, true),
('Super Admin', 'products', true, true, true),
('Super Admin', 'services', true, true, true),
('Super Admin', 'process', true, true, true),
('Super Admin', 'industries', true, true, true),
('Super Admin', 'techstack', true, true, true),
('Super Admin', 'team', true, true, true),
('Super Admin', 'gallery', true, true, true),
('Super Admin', 'reviews', true, true, true),
('Super Admin', 'careers', true, true, true),
('Super Admin', 'hero-slider', true, true, true),
('Super Admin', 'hero-about', true, true, true),
('Super Admin', 'messages', true, true, true),
('Super Admin', 'footer-settings', true, true, true),
('Super Admin', 'settings-seo', true, true, true),
('Super Admin', 'branding', true, true, true),

-- Admin (Products, Services, Gallery, Team, Careers, Reviews, Messages, Branding, content)
('Admin', 'dashboard', true, true, true),
('Admin', 'products', true, true, true),
('Admin', 'services', true, true, true),
('Admin', 'gallery', true, true, true),
('Admin', 'team', true, true, true),
('Admin', 'careers', true, true, true),
('Admin', 'reviews', true, true, true),
('Admin', 'messages', true, true, true),
('Admin', 'branding', true, true, true),
('Admin', 'footer-settings', true, true, true),
('Admin', 'hero-about', true, true, true),
('Admin', 'hero-slider', true, true, true),
('Admin', 'process', true, true, true),
('Admin', 'industries', true, true, true),
('Admin', 'techstack', true, true, true),

-- Editor (Edit website content, create/edit Products, Services, Gallery, Team. No user management or system settings)
('Editor', 'dashboard', true, true, false),
('Editor', 'products', true, true, false),
('Editor', 'services', true, true, false),
('Editor', 'gallery', true, true, false),
('Editor', 'team', true, true, false),
('Editor', 'branding', true, true, false),
('Editor', 'footer-settings', true, true, false),
('Editor', 'hero-about', true, true, false),
('Editor', 'hero-slider', true, true, false),
('Editor', 'process', true, true, false),
('Editor', 'industries', true, true, false),
('Editor', 'techstack', true, true, false)
ON CONFLICT (role, module) DO UPDATE SET
  can_read = EXCLUDED.can_read,
  can_write = EXCLUDED.can_write,
  can_delete = EXCLUDED.can_delete;
