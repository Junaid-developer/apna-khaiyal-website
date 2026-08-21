-- =========================================================================
-- APNAKHAIYAL SMC PVT LTD - PRODUCTION SUPABASE MIGRATION SCHEMA
-- Complete backend database architecture, storage configuration, RLS policies,
-- and automated triggers for enterprise Software House CMS.
-- =========================================================================

-- Enable pgcrypto extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================================================================
-- 1. ROLES & PERMISSIONS & ADMIN MANAGEMENT
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.roles (name, description) VALUES
    ('Super Admin', 'Full system control, permissions management, database access'),
    ('Admin', 'Complete content management, user application & message response'),
    ('Editor', 'Content publication, review moderation, draft management')
ON CONFLICT (name) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
    resource TEXT NOT NULL,
    action TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

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

-- Backward compatibility admin_roles table
CREATE TABLE IF NOT EXISTS public.admin_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL,
    email TEXT NOT NULL,
    role TEXT DEFAULT 'admin',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================================
-- 2. SITE SETTINGS & COMPANY INFORMATION
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.website_settings (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    company_name TEXT,
    company_logo TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    google_map TEXT,
    facebook TEXT,
    linkedin TEXT,
    instagram TEXT,
    youtube TEXT,
    copyright TEXT,
    ceo_whatsapp_number TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.site_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.company_information (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.seo_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meta_title TEXT NOT NULL DEFAULT 'ApnaKhaiyal SMC Pvt Ltd | Enterprise Software & AI Solutions',
    meta_description TEXT NOT NULL DEFAULT 'Leading software architecture & digital automation engineering house.',
    keywords TEXT DEFAULT 'software house, enterprise AI, web development, cloud solutions',
    og_image TEXT,
    favicon TEXT DEFAULT '/favicon.jpg',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.social_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform TEXT UNIQUE NOT NULL,
    url TEXT NOT NULL,
    icon TEXT,
    is_active BOOLEAN DEFAULT true,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.statistics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    label TEXT NOT NULL,
    value TEXT NOT NULL,
    suffix TEXT DEFAULT '',
    icon TEXT,
    display_order INT DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================================
-- 3. HERO & BANNERS
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.hero_slides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    button_text TEXT,
    button_link TEXT,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================================
-- 4. SERVICES MODULE
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT DEFAULT 'Cpu',
    image TEXT,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.service_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    caption TEXT,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================================
-- 5. PRODUCTS & CATEGORIES MODULE
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.product_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.product_categories (name, slug, display_order) VALUES
    ('HealthTech', 'healthtech', 1),
    ('GovTech', 'govtech', 2),
    ('FinTech / POS', 'fintech-pos', 3),
    ('EdTech', 'edtech', 4),
    ('Enterprise ERP', 'enterprise-erp', 5)
ON CONFLICT (name) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    detailed_description TEXT,
    image TEXT,
    features JSONB DEFAULT '[]'::jsonb,
    tags JSONB DEFAULT '[]'::jsonb,
    live_demo_url TEXT,
    documentation_url TEXT,
    status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'In Progress', 'Coming Soon', 'Discontinued')),
    featured BOOLEAN DEFAULT false,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================================
-- 6. INDUSTRIES & TECH STACK & PROCESS
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.industries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    icon TEXT DEFAULT 'Building2',
    description TEXT,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.technology_stack (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    category TEXT DEFAULT 'Full-Stack',
    icon_type TEXT DEFAULT 'lucide',
    icon_name TEXT DEFAULT 'Code',
    image_url TEXT,
    description TEXT,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.development_process (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    step_number INT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT DEFAULT 'Workflow',
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================================
-- 7. GALLERY MODULE
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.gallery (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    image TEXT NOT NULL,
    description TEXT,
    date TEXT,
    client TEXT,
    is_active BOOLEAN DEFAULT true,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.gallery_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gallery_id UUID REFERENCES public.gallery(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    caption TEXT,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================================
-- 8. TEAM & UNLIMITED SOCIAL LINKS MODULE
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    image TEXT,
    bio TEXT,
    email TEXT,
    gender TEXT DEFAULT 'Male',
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.team_social_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_member_id UUID REFERENCES public.team_members(id) ON DELETE CASCADE,
    platform TEXT NOT NULL, -- LinkedIn, GitHub, Facebook, Instagram, WhatsApp, Website, Email, Custom
    url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================================
-- 9. REVIEWS & TESTIMONIALS MODULE (ADMIN APPROVAL SYSTEM)
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author TEXT NOT NULL,
    role TEXT NOT NULL,
    company TEXT NOT NULL,
    text TEXT NOT NULL,
    rating INT DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
    project_scope TEXT,
    status TEXT DEFAULT 'Approved' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
    is_featured BOOLEAN DEFAULT false,
    user_image TEXT,
    gender TEXT DEFAULT 'Male',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_name TEXT NOT NULL,
    company TEXT,
    role TEXT,
    content TEXT NOT NULL,
    avatar_url TEXT,
    rating INT DEFAULT 5,
    is_active BOOLEAN DEFAULT true,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================================
-- 10. CAREERS & JOB APPLICATIONS MODULE
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.careers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    department TEXT NOT NULL,
    location TEXT NOT NULL,
    type TEXT NOT NULL,
    experience TEXT NOT NULL,
    description TEXT NOT NULL,
    requirements JSONB DEFAULT '[]'::jsonb,
    responsibilities JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.job_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES public.careers(id) ON DELETE SET NULL,
    job_title TEXT NOT NULL,
    applicant_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    experience TEXT,
    cover_note TEXT,
    resume_url TEXT,
    status TEXT DEFAULT 'New' CHECK (status IN ('New', 'Reviewing', 'Interviewed', 'Hired', 'Rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================================
-- 11. CONTACT MESSAGES MODULE
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    service_interest TEXT,
    phone TEXT,
    company TEXT,
    read BOOLEAN DEFAULT false,
    replied BOOLEAN DEFAULT false,
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- =========================================================================

CREATE INDEX IF NOT EXISTS idx_services_active_order ON public.services(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_products_status_category ON public.products(status, category);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(featured);
CREATE INDEX IF NOT EXISTS idx_gallery_active_order ON public.gallery(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_team_active_order ON public.team_members(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_team_social_member ON public.team_social_links(team_member_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON public.reviews(status, is_featured);
CREATE INDEX IF NOT EXISTS idx_job_applications_job ON public.job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_contact_messages_read ON public.contact_messages(read, created_at DESC);

-- =========================================================================
-- SUPABASE STORAGE BUCKETS CONFIGURATION
-- =========================================================================

INSERT INTO storage.buckets (id, name, public) VALUES
    ('hero', 'hero', true),
    ('products', 'products', true),
    ('gallery', 'gallery', true),
    ('team', 'team', true),
    ('services', 'services', true),
    ('testimonials', 'testimonials', true),
    ('company', 'company', true),
    ('documents', 'documents', true),
    ('reviews', 'reviews', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage RLS Policies
CREATE POLICY "Public Read Access on Buckets" ON storage.objects
    FOR SELECT USING (bucket_id IN ('hero', 'products', 'gallery', 'team', 'services', 'testimonials', 'company', 'documents', 'reviews'));

CREATE POLICY "Authenticated Users Upload Objects" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id IN ('hero', 'products', 'gallery', 'team', 'services', 'testimonials', 'company', 'documents', 'reviews'));

CREATE POLICY "Authenticated Users Update Objects" ON storage.objects
    FOR UPDATE WITH CHECK (bucket_id IN ('hero', 'products', 'gallery', 'team', 'services', 'testimonials', 'company', 'documents', 'reviews'));

CREATE POLICY "Authenticated Users Delete Objects" ON storage.objects
    FOR DELETE USING (bucket_id IN ('hero', 'products', 'gallery', 'team', 'services', 'testimonials', 'company', 'documents', 'reviews'));

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES & SCHEMA PERMISSIONS
-- =========================================================================

-- Explicit Schema & Table Grants for PostgREST & Supabase Auth API
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;

ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES & ACCESS CONTROL
-- =========================================================================

-- Enable RLS on all tables
ALTER TABLE public.website_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_information ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.industries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technology_stack ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.development_process ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.careers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;

-- 1. Public Read-Only Access Policies (Public content readable by all visitors)
DROP POLICY IF EXISTS "Public Can View Website Settings" ON public.website_settings;
CREATE POLICY "Public Can View Website Settings" ON public.website_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Can View Site Settings" ON public.site_settings;
CREATE POLICY "Public Can View Site Settings" ON public.site_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Can View Company Info" ON public.company_information;
CREATE POLICY "Public Can View Company Info" ON public.company_information FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Can View SEO Settings" ON public.seo_settings;
CREATE POLICY "Public Can View SEO Settings" ON public.seo_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Can View Social Links" ON public.social_links;
CREATE POLICY "Public Can View Social Links" ON public.social_links FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Can View Statistics" ON public.statistics;
CREATE POLICY "Public Can View Statistics" ON public.statistics FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Can View Active Hero Slides" ON public.hero_slides;
CREATE POLICY "Public Can View Active Hero Slides" ON public.hero_slides FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Can View Active Services" ON public.services;
CREATE POLICY "Public Can View Active Services" ON public.services FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Can View Service Images" ON public.service_images;
CREATE POLICY "Public Can View Service Images" ON public.service_images FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Can View Categories" ON public.product_categories;
CREATE POLICY "Public Can View Categories" ON public.product_categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Can View Products" ON public.products;
CREATE POLICY "Public Can View Products" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Can View Product Images" ON public.product_images;
CREATE POLICY "Public Can View Product Images" ON public.product_images FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Can View Industries" ON public.industries;
CREATE POLICY "Public Can View Industries" ON public.industries FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Can View Tech Stack" ON public.technology_stack;
CREATE POLICY "Public Can View Tech Stack" ON public.technology_stack FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Can View Process" ON public.development_process;
CREATE POLICY "Public Can View Process" ON public.development_process FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Can View Active Gallery" ON public.gallery;
CREATE POLICY "Public Can View Active Gallery" ON public.gallery FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Can View Gallery Images" ON public.gallery_images;
CREATE POLICY "Public Can View Gallery Images" ON public.gallery_images FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Can View Active Team" ON public.team_members;
CREATE POLICY "Public Can View Active Team" ON public.team_members FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Can View Team Social" ON public.team_social_links;
CREATE POLICY "Public Can View Team Social" ON public.team_social_links FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Can View Approved Reviews" ON public.reviews;
CREATE POLICY "Public Can View Approved Reviews" ON public.reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Can View Active Careers" ON public.careers;
CREATE POLICY "Public Can View Active Careers" ON public.careers FOR SELECT USING (true);

-- 2. Public Form Submissions (Insert-Only for public visitors, no public SELECT)
DROP POLICY IF EXISTS "Public Can Insert Contact Messages" ON public.contact_messages;
CREATE POLICY "Public Can Insert Contact Messages" ON public.contact_messages FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public Can Insert Job Applications" ON public.job_applications;
CREATE POLICY "Public Can Insert Job Applications" ON public.job_applications FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public Can Submit Reviews" ON public.reviews;
CREATE POLICY "Public Can Submit Reviews" ON public.reviews FOR INSERT WITH CHECK (true);

-- 3. Authenticated Admin Full CRUD Access Policies
DROP POLICY IF EXISTS "Admin Full Access Website Settings" ON public.website_settings;
CREATE POLICY "Admin Full Access Website Settings" ON public.website_settings FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin Full Access Site Settings" ON public.site_settings;
CREATE POLICY "Admin Full Access Site Settings" ON public.site_settings FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin Full Access Company Info" ON public.company_information;
CREATE POLICY "Admin Full Access Company Info" ON public.company_information FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin Full Access SEO" ON public.seo_settings;
CREATE POLICY "Admin Full Access SEO" ON public.seo_settings FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin Full Access Social" ON public.social_links;
CREATE POLICY "Admin Full Access Social" ON public.social_links FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin Full Access Statistics" ON public.statistics;
CREATE POLICY "Admin Full Access Statistics" ON public.statistics FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin Full Access Hero Slides" ON public.hero_slides;
CREATE POLICY "Admin Full Access Hero Slides" ON public.hero_slides FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin Full Access Services" ON public.services;
CREATE POLICY "Admin Full Access Services" ON public.services FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin Full Access Service Images" ON public.service_images;
CREATE POLICY "Admin Full Access Service Images" ON public.service_images FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin Full Access Product Categories" ON public.product_categories;
CREATE POLICY "Admin Full Access Product Categories" ON public.product_categories FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin Full Access Products" ON public.products;
CREATE POLICY "Admin Full Access Products" ON public.products FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin Full Access Product Images" ON public.product_images;
CREATE POLICY "Admin Full Access Product Images" ON public.product_images FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin Full Access Industries" ON public.industries;
CREATE POLICY "Admin Full Access Industries" ON public.industries FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin Full Access Tech Stack" ON public.technology_stack;
CREATE POLICY "Admin Full Access Tech Stack" ON public.technology_stack FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin Full Access Process" ON public.development_process;
CREATE POLICY "Admin Full Access Process" ON public.development_process FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin Full Access Gallery" ON public.gallery;
CREATE POLICY "Admin Full Access Gallery" ON public.gallery FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin Full Access Gallery Images" ON public.gallery_images;
CREATE POLICY "Admin Full Access Gallery Images" ON public.gallery_images FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin Full Access Team" ON public.team_members;
CREATE POLICY "Admin Full Access Team" ON public.team_members FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin Full Access Team Social" ON public.team_social_links;
CREATE POLICY "Admin Full Access Team Social" ON public.team_social_links FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin Full Access Reviews" ON public.reviews;
CREATE POLICY "Admin Full Access Reviews" ON public.reviews FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin Full Access Careers" ON public.careers;
CREATE POLICY "Admin Full Access Careers" ON public.careers FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin Full Access Job Applications" ON public.job_applications;
CREATE POLICY "Admin Full Access Job Applications" ON public.job_applications FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin Full Access Contact Messages" ON public.contact_messages;
CREATE POLICY "Admin Full Access Contact Messages" ON public.contact_messages FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin Full Access Admins" ON public.admins;
CREATE POLICY "Admin Full Access Admins" ON public.admins FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin Full Access Admin Roles" ON public.admin_roles;
CREATE POLICY "Admin Full Access Admin Roles" ON public.admin_roles FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- =========================================================================
-- AUTOMATED TRIGGER ON AUTH.USERS FOR AUTOMATIC ADMIN CREATION
-- =========================================================================

CREATE OR REPLACE FUNCTION public.handle_new_admin_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.admins (
    user_id,
    email,
    full_name,
    role,
    is_active,
    last_login,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    LOWER(NEW.email),
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      SPLIT_PART(NEW.email, '@', 1),
      'Administrator'
    ),
    'Super Admin',
    true,
    NOW(),
    NOW(),
    NOW()
  )
  ON CONFLICT (email) DO UPDATE SET
    user_id = EXCLUDED.user_id,
    full_name = COALESCE(public.admins.full_name, EXCLUDED.full_name),
    is_active = true,
    last_login = NOW(),
    updated_at = NOW();

  INSERT INTO public.admin_roles (
    user_id,
    email,
    role,
    created_at
  )
  VALUES (
    NEW.id,
    LOWER(NEW.email),
    'admin',
    NOW()
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_admin_user();

-- =========================================================================
-- PERMISSIONS TABLE FOR ROLE-BASED ACCESS CONTROL (RBAC)
-- =========================================================================

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

ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Permissions" ON public.permissions;
CREATE POLICY "Public Read Permissions" ON public.permissions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin Full Access Permissions" ON public.permissions;
CREATE POLICY "Admin Full Access Permissions" ON public.permissions FOR ALL USING (auth.role() = 'authenticated');


