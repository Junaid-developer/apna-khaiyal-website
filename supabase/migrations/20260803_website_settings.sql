-- Migration: Create website_settings table and configure security policies
-- File: supabase/migrations/20260803_website_settings.sql

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

-- Index for fast key lookups
CREATE INDEX IF NOT EXISTS idx_website_settings_key ON public.website_settings(key);

-- Enable Row Level Security (RLS)
ALTER TABLE public.website_settings ENABLE ROW LEVEL SECURITY;

-- 1. Public Read Policy
DROP POLICY IF EXISTS "Public Can View Website Settings" ON public.website_settings;
CREATE POLICY "Public Can View Website Settings" ON public.website_settings 
    FOR SELECT 
    USING (true);

-- 2. Universal Access for Application Admin Operations
DROP POLICY IF EXISTS "Full Access Website Settings" ON public.website_settings;
CREATE POLICY "Full Access Website Settings" ON public.website_settings 
    FOR ALL 
    USING (true)
    WITH CHECK (true);

-- Grant table privileges
GRANT ALL ON TABLE public.website_settings TO anon, authenticated, service_role;
