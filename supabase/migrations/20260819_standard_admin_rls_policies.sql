-- ====================================================================
-- SUPABASE RLS POLICIES FOR AUTHENTICATED ADMINS AND PUBLIC CMS ACCESS
-- ====================================================================
-- Tables covered:
--   1. products
--   2. services
--   3. team_members
--   4. gallery
--   5. careers
--   6. reviews (and client_reviews)
--   7. contact_messages
--   8. job_applications
--   9. hero_slides
-- ====================================================================

-- --------------------------------------------------------------------
-- STEP 1: Enable Row Level Security (RLS) on all core public tables
-- --------------------------------------------------------------------
ALTER TABLE IF EXISTS public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.careers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.client_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.hero_slides ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------------------
-- STEP 2: Grant core schema and table permissions
-- --------------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT INSERT ON public.contact_messages TO anon;
GRANT INSERT ON public.job_applications TO anon;
GRANT INSERT ON public.reviews TO anon;
GRANT INSERT ON public.client_reviews TO anon;

-- --------------------------------------------------------------------
-- STEP 3: Drop existing policies to prevent naming conflict errors
-- --------------------------------------------------------------------
-- products
DROP POLICY IF EXISTS "Admins full access" ON public.products;
DROP POLICY IF EXISTS "Allow public read access on products" ON public.products;
DROP POLICY IF EXISTS "Allow admin full access on products" ON public.products;

-- services
DROP POLICY IF EXISTS "Admins full access" ON public.services;
DROP POLICY IF EXISTS "Allow public read access on services" ON public.services;
DROP POLICY IF EXISTS "Allow admin full access on services" ON public.services;

-- team_members
DROP POLICY IF EXISTS "Admins full access" ON public.team_members;
DROP POLICY IF EXISTS "Allow public read access on team_members" ON public.team_members;
DROP POLICY IF EXISTS "Allow admin full access on team_members" ON public.team_members;

-- gallery
DROP POLICY IF EXISTS "Admins full access" ON public.gallery;
DROP POLICY IF EXISTS "Allow public read access on gallery" ON public.gallery;
DROP POLICY IF EXISTS "Allow admin full access on gallery" ON public.gallery;

-- careers
DROP POLICY IF EXISTS "Admins full access" ON public.careers;
DROP POLICY IF EXISTS "Allow public read access on careers" ON public.careers;
DROP POLICY IF EXISTS "Allow admin full access on careers" ON public.careers;

-- reviews & client_reviews
DROP POLICY IF EXISTS "Admins full access" ON public.reviews;
DROP POLICY IF EXISTS "Allow public read access on reviews" ON public.reviews;
DROP POLICY IF EXISTS "Allow public insert access on reviews" ON public.reviews;
DROP POLICY IF EXISTS "Admins full access" ON public.client_reviews;
DROP POLICY IF EXISTS "Allow public read access on client_reviews" ON public.client_reviews;

-- contact_messages
DROP POLICY IF EXISTS "Admins full access" ON public.contact_messages;
DROP POLICY IF EXISTS "Allow public insert on contact_messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Allow admin full access on contact_messages" ON public.contact_messages;

-- job_applications
DROP POLICY IF EXISTS "Admins full access" ON public.job_applications;
DROP POLICY IF EXISTS "Allow public insert on job_applications" ON public.job_applications;
DROP POLICY IF EXISTS "Allow admin full access on job_applications" ON public.job_applications;

-- hero_slides
DROP POLICY IF EXISTS "Admins full access" ON public.hero_slides;
DROP POLICY IF EXISTS "Allow public read access on hero_slides" ON public.hero_slides;
DROP POLICY IF EXISTS "Allow admin full access on hero_slides" ON public.hero_slides;

-- --------------------------------------------------------------------
-- STEP 4: Define Public Read & Form Submission Policies
-- --------------------------------------------------------------------
-- Public Read for Catalog & Content
CREATE POLICY "Allow public read access on products" 
ON public.products FOR SELECT 
TO public USING (true);

CREATE POLICY "Allow public read access on services" 
ON public.services FOR SELECT 
TO public USING (true);

CREATE POLICY "Allow public read access on team_members" 
ON public.team_members FOR SELECT 
TO public USING (true);

CREATE POLICY "Allow public read access on gallery" 
ON public.gallery FOR SELECT 
TO public USING (true);

CREATE POLICY "Allow public read access on careers" 
ON public.careers FOR SELECT 
TO public USING (true);

CREATE POLICY "Allow public read access on reviews" 
ON public.reviews FOR SELECT 
TO public USING (true);

CREATE POLICY "Allow public read access on hero_slides" 
ON public.hero_slides FOR SELECT 
TO public USING (true);

-- Public Form Submissions
CREATE POLICY "Allow public insert on contact_messages" 
ON public.contact_messages FOR INSERT 
TO public WITH CHECK (true);

CREATE POLICY "Allow public insert on job_applications" 
ON public.job_applications FOR INSERT 
TO public WITH CHECK (true);

CREATE POLICY "Allow public insert on reviews" 
ON public.reviews FOR INSERT 
TO public WITH CHECK (true);

-- --------------------------------------------------------------------
-- STEP 5: Define Standard Full Access (ALL) RLS Policies for Admins
-- --------------------------------------------------------------------

-- 1. PRODUCTS
CREATE POLICY "Admins full access" 
ON public.products FOR ALL 
TO authenticated 
USING (
  auth.uid() IN (SELECT user_id FROM public.admins)
) 
WITH CHECK (
  auth.uid() IN (SELECT user_id FROM public.admins)
);

-- 2. SERVICES
CREATE POLICY "Admins full access" 
ON public.services FOR ALL 
TO authenticated 
USING (
  auth.uid() IN (SELECT user_id FROM public.admins)
) 
WITH CHECK (
  auth.uid() IN (SELECT user_id FROM public.admins)
);

-- 3. TEAM MEMBERS
CREATE POLICY "Admins full access" 
ON public.team_members FOR ALL 
TO authenticated 
USING (
  auth.uid() IN (SELECT user_id FROM public.admins)
) 
WITH CHECK (
  auth.uid() IN (SELECT user_id FROM public.admins)
);

-- 4. GALLERY
CREATE POLICY "Admins full access" 
ON public.gallery FOR ALL 
TO authenticated 
USING (
  auth.uid() IN (SELECT user_id FROM public.admins)
) 
WITH CHECK (
  auth.uid() IN (SELECT user_id FROM public.admins)
);

-- 5. CAREERS
CREATE POLICY "Admins full access" 
ON public.careers FOR ALL 
TO authenticated 
USING (
  auth.uid() IN (SELECT user_id FROM public.admins)
) 
WITH CHECK (
  auth.uid() IN (SELECT user_id FROM public.admins)
);

-- 6. REVIEWS
CREATE POLICY "Admins full access" 
ON public.reviews FOR ALL 
TO authenticated 
USING (
  auth.uid() IN (SELECT user_id FROM public.admins)
) 
WITH CHECK (
  auth.uid() IN (SELECT user_id FROM public.admins)
);

-- 7. CONTACT MESSAGES
CREATE POLICY "Admins full access" 
ON public.contact_messages FOR ALL 
TO authenticated 
USING (
  auth.uid() IN (SELECT user_id FROM public.admins)
) 
WITH CHECK (
  auth.uid() IN (SELECT user_id FROM public.admins)
);

-- 8. JOB APPLICATIONS
CREATE POLICY "Admins full access" 
ON public.job_applications FOR ALL 
TO authenticated 
USING (
  auth.uid() IN (SELECT user_id FROM public.admins)
) 
WITH CHECK (
  auth.uid() IN (SELECT user_id FROM public.admins)
);

-- 9. HERO SLIDES
CREATE POLICY "Admins full access" 
ON public.hero_slides FOR ALL 
TO authenticated 
USING (
  auth.uid() IN (SELECT user_id FROM public.admins)
) 
WITH CHECK (
  auth.uid() IN (SELECT user_id FROM public.admins)
);
