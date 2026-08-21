-- Migration: Drop and recreate public.company_information table as single source of truth for corporate contact details
DROP TABLE IF EXISTS public.company_information CASCADE;

CREATE TABLE public.company_information (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT NOT NULL DEFAULT 'ApnaKhaiyal',
    email TEXT NOT NULL DEFAULT 'info@apnakhaiyal.com',
    phone TEXT NOT NULL DEFAULT '+92 300 1234567',
    ceo_whatsapp TEXT DEFAULT '+9230591101291',
    address TEXT DEFAULT 'Premium Tech Block, Sector G-11, Islamabad, Pakistan',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Explicitly grant permissions to anon, authenticated, and service_role
GRANT ALL ON public.company_information TO anon;
GRANT ALL ON public.company_information TO authenticated;
GRANT ALL ON public.company_information TO service_role;

-- Enable Row Level Security (RLS)
ALTER TABLE public.company_information ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Allow public SELECT, INSERT, and UPDATE access
CREATE POLICY "Allow public read access to company_information"
ON public.company_information FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow public insert to company_information"
ON public.company_information FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Allow public update to company_information"
ON public.company_information FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Seed initial row
INSERT INTO public.company_information (id, company_name, email, phone, ceo_whatsapp, address)
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'ApnaKhaiyal',
    'info@apnakhaiyal.com',
    '+92 300 1234567',
    '+9230591101291',
    'Premium Tech Block, Sector G-11, Islamabad, Pakistan'
);

-- Force PostgREST schema cache reload
NOTIFY pgrst, 'reload schema';

