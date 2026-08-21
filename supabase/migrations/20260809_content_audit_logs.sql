-- =========================================================================
-- MIGRATION: CONTENT AUDIT LOGS TABLE & POLICIES
-- File: supabase/migrations/20260809_content_audit_logs.sql
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.content_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email TEXT NOT NULL,
    user_role TEXT DEFAULT 'HR',
    action_type TEXT NOT NULL, -- e.g., 'CREATE', 'UPDATE', 'DELETE', 'STATUS_CHANGE'
    content_type TEXT NOT NULL, -- e.g., 'Job Posting', 'Job Application', 'Contact Message', 'Company Info', 'System Setting'
    details TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Grant privileges
GRANT ALL ON TABLE public.content_audit_logs TO anon, authenticated, service_role;

-- Enable Row Level Security (RLS)
ALTER TABLE public.content_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read content_audit_logs" ON public.content_audit_logs;
CREATE POLICY "Allow read content_audit_logs" ON public.content_audit_logs FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Allow write content_audit_logs" ON public.content_audit_logs;
CREATE POLICY "Allow write content_audit_logs" ON public.content_audit_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Insert initial sample audit logs for demonstration
INSERT INTO public.content_audit_logs (user_email, user_role, action_type, content_type, details)
VALUES
    ('hr@apnakhaiyal.com', 'HR', 'UPDATE', 'Job Posting', 'Updated Senior Full Stack Engineer requirements and benefits.'),
    ('hr@apnakhaiyal.com', 'HR', 'STATUS_CHANGE', 'Job Application', 'Marked candidate application #A-104 as Reviewed.'),
    ('hr@apnakhaiyal.com', 'HR', 'REPLY', 'Contact Message', 'Responded to client inquiry regarding enterprise AI consulting.'),
    ('admin@apnakhaiyal.com', 'Admin', 'UPDATE', 'Company Info', 'Updated corporate address and CEO WhatsApp contact details.'),
    ('hr@apnakhaiyal.com', 'HR', 'CREATE', 'Job Posting', 'Published new listing for Autonomous AI Agent Developer.')
ON CONFLICT DO NOTHING;

-- Force PostgREST schema cache reload
NOTIFY pgrst, 'reload schema';
