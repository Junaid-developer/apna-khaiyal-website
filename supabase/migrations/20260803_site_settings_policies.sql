-- =========================================================================
-- MIGRATION: Populate site_settings & website_settings in Supabase
-- File: supabase/migrations/20260803_site_settings_policies.sql
-- =========================================================================

-- 1. Create site_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.site_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create website_settings table if it doesn't exist
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

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_settings ENABLE ROW LEVEL SECURITY;

-- 4. Set RLS Policies for site_settings
DROP POLICY IF EXISTS "Public Can View Site Settings" ON public.site_settings;
CREATE POLICY "Public Can View Site Settings" ON public.site_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Universal Access Site Settings" ON public.site_settings;
CREATE POLICY "Universal Access Site Settings" ON public.site_settings FOR ALL USING (true) WITH CHECK (true);

-- 5. Set RLS Policies for website_settings
DROP POLICY IF EXISTS "Public Can View Website Settings" ON public.website_settings;
CREATE POLICY "Public Can View Website Settings" ON public.website_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Universal Access Website Settings" ON public.website_settings;
CREATE POLICY "Universal Access Website Settings" ON public.website_settings FOR ALL USING (true) WITH CHECK (true);

-- 6. Grant Privileges to Roles
GRANT ALL ON TABLE public.site_settings TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.website_settings TO anon, authenticated, service_role;

-- 7. Insert default records into site_settings with ON CONFLICT (key) DO NOTHING

-- A. ceo_whatsapp_number
INSERT INTO public.site_settings (key, value)
VALUES (
  'ceo_whatsapp_number',
  '{"number": "+923001234567"}'::jsonb
)
ON CONFLICT (key) DO NOTHING;

-- B. hero
INSERT INTO public.site_settings (key, value)
VALUES (
  'hero',
  '{
    "heading": "Transforming Businesses Through Technology",
    "subHeading": "We engineer high-performance software, intelligent agentic AI solutions, and premium digital systems tailored for global enterprise growth.",
    "imageUrl": "",
    "primaryBtnText": "Explore Flagship Products",
    "primaryBtnLink": "products",
    "secondaryBtnText": "Request Consult",
    "secondaryBtnLink": "contact"
  }'::jsonb
)
ON CONFLICT (key) DO NOTHING;

-- C. about
INSERT INTO public.site_settings (key, value)
VALUES (
  'about',
  '{
    "companyStory": "ApnaKhaiyal SMC Pvt Ltd was founded with a single focus: to elevate standard corporate processes into seamless, automated, high-yield digital structures. Over the last 4+ years, we have designed, optimized, and deployed customized software suites for schools, town finances, hospitals, and retail enterprises worldwide.",
    "mission": "To architect scalable, secure, and beautiful technical ecosystems that empower global organizations to focus on what matters most — their people and core purpose.",
    "vision": "To lead the next epoch of intelligent system automation, serving as the trusted technical foundation for enterprises transitioning to the Agentic AI era.",
    "experience": "4+ Years of Engineering Excellence",
    "achievements": [
      "50+ Global Enterprises Empowered",
      "99.9% Production System Uptime",
      "6+ High-Impact Flagship Software Products",
      "4+ Years of Constant Tech Evolution"
    ],
    "imageUrl": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop"
  }'::jsonb
)
ON CONFLICT (key) DO NOTHING;

-- D. settings
INSERT INTO public.site_settings (key, value)
VALUES (
  'settings',
  '{
    "companyName": "ApnaKhaiyal",
    "logoText": "ApnaKhaiyal",
    "phone": "+92 300 1234567",
    "email": "info@apnakhaiyal.com",
    "address": "Premium Tech Block, Sector G-11, Islamabad, Pakistan",
    "googleMapsEmbedUrl": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3319.467814880949!2d73.00392301520593!3d33.68442228070742!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38dfbec47863bfcd%3A0xe2128b9d6289b52a!2sG-11%20Sector%20G-11%2C%20Islamabad%2C%20Pakistan!5e0!3m2!1sen!2s!4v1655555555555!5m2!1sen!2s",
    "whatsappNumber": "+923001234567",
    "ceoWhatsAppNumber": "+923001234567",
    "copyright": "© 2026 ApnaKhaiyal. All rights reserved.",
    "servicesSectionHeading": "Our Expertise",
    "servicesSectionSubtitle": "We deliver premium enterprise solutions.",
    "productShowcaseSectionHeading": "Featured Proprietary Systems",
    "processSectionSmallHeading": "Engineering Workflow",
    "processSectionMainHeading": "Our Rigorous Development Process",
    "industriesSectionHeading": "Industries We Serve",
    "industriesSectionSubtitle": "Delivering robust automation schemas across multiple vertical segments.",
    "techStackSectionHeading": "Our Technology Stack",
    "galleryDescription": "Inspect photographs from strategy briefings, product launches, and community meets.",
    "teamDescription": "Meet the executive developers, AI leads, and systems designers building ApnaKhaiyal pipelines.",
    "socialLinks": {
      "facebook": "https://facebook.com/apnakhaiyal",
      "twitter": "https://twitter.com/apnakhaiyal",
      "linkedin": "https://linkedin.com/company/apnakhaiyal",
      "github": "https://github.com/apnakhaiyal",
      "instagram": "https://instagram.com/apnakhaiyal",
      "youtube": "https://youtube.com/apnakhaiyal"
    }
  }'::jsonb
)
ON CONFLICT (key) DO NOTHING;

-- E. seo
INSERT INTO public.site_settings (key, value)
VALUES (
  'seo',
  '{
    "metaTitle": "ApnaKhaiyal | Transforming Businesses Through Technology",
    "metaDescription": "ApnaKhaiyal is a premium software house building state-of-the-art Web Development, Mobile Apps, Desktop Systems, and Agentic AI Solutions.",
    "keywords": "software house, mobile app, web development, Agentic AI, AI automation, custom software, Islamabad software company, enterprise software",
    "ogImage": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop",
    "twitterCard": "summary_large_image"
  }'::jsonb
)
ON CONFLICT (key) DO NOTHING;

-- F. careers
INSERT INTO public.site_settings (key, value)
VALUES (
  'careers',
  '[
    {
      "id": "j1",
      "title": "Senior Full Stack Engineer (React/Node)",
      "type": "job",
      "department": "Engineering",
      "location": "Islamabad, Pakistan (Onsite/Hybrid)",
      "description": "We are seeking a seasoned Full Stack Engineer with exceptional control of React 19, Node.js, and complex SQL schema optimization to design next-gen enterprise portals.",
      "requirements": [
        "4+ years of professional backend & client-side software architecture experience.",
        "In-depth command of Tailwind, TypeScript, state management systems, and query indexing."
      ],
      "benefits": [
        "Highly competitive salary package and profit-sharing dividends.",
        "Premium family health insurance & physical wellness allowance."
      ],
      "active": true
    },
    {
      "id": "j2",
      "title": "Autonomous AI Agent Developer",
      "type": "job",
      "department": "AI & Automation",
      "location": "Remote / Hybrid",
      "description": "Help us build intelligent Agentic AI networks capable of handling multi-tier corporate pipelines and automated data mapping.",
      "requirements": [
        "Strong background in Python, LangChain, or Google GenAI modern tools.",
        "Familiarity with vectorized search engines and prompt engineering."
      ],
      "benefits": [
        "Access to premium hardware stacks and compute credits.",
        "Flexible hybrid hours with complete outcome-based autonomy."
      ],
      "active": true
    }
  ]'::jsonb
)
ON CONFLICT (key) DO NOTHING;

-- G. expertise
INSERT INTO public.site_settings (key, value)
VALUES (
  'expertise',
  '[
    {"id": "exp1", "name": "Web Platforms (React / Node)", "displayOrder": 1},
    {"id": "exp2", "name": "Custom iOS & Android Apps", "displayOrder": 2},
    {"id": "exp3", "name": "High-velocity POS & Desktop", "displayOrder": 3},
    {"id": "exp4", "name": "Enterprise double-ledger Finance", "displayOrder": 4},
    {"id": "exp5", "name": "Autonomous Agentic AI Pipelines", "displayOrder": 5},
    {"id": "exp6", "name": "Strategic SEO Growth Engines", "displayOrder": 6}
  ]'::jsonb
)
ON CONFLICT (key) DO NOTHING;

-- H. office
INSERT INTO public.site_settings (key, value)
VALUES (
  'office',
  '{
    "address": "Premium Tech Block, Sector G-11, Islamabad, Pakistan",
    "phone": "+92 300 1234567",
    "email": "info@apnakhaiyal.com",
    "googleMapLink": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3319.467814880949!2d73.00392301520593!3d33.68442228070742!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38dfbec47863bfcd%3A0xe2128b9d6289b52a!2sG-11%20Sector%20G-11%2C%20Islamabad%2C%20Pakistan!5e0!3m2!1sen!2s!4v1655555555555!5m2!1sen!2s"
  }'::jsonb
)
ON CONFLICT (key) DO NOTHING;

-- Also seed website_settings for backwards compatibility
INSERT INTO public.website_settings (key, value)
VALUES 
  ('ceo_whatsapp_number', '{"number": "+923001234567"}'::jsonb),
  ('hero', '{"heading": "Transforming Businesses Through Technology"}'::jsonb),
  ('about', '{"experience": "4+ Years of Engineering Excellence"}'::jsonb),
  ('settings', '{"companyName": "ApnaKhaiyal", "ceoWhatsAppNumber": "+923001234567"}'::jsonb)
ON CONFLICT (key) DO NOTHING;
