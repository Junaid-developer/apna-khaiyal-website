-- Fix public job applications for Careers stored in site_settings.
-- The website currently stores Careers in site_settings, while job_applications.job_id
-- references public.careers(id). That FK rejects valid applications for jobs that
-- exist in the website's Careers settings but are not duplicated in public.careers.
-- Keep job_id as an optional UUID for historical/reference purposes, but do not
-- enforce a foreign key to the legacy careers table.

ALTER TABLE IF EXISTS public.job_applications
  DROP CONSTRAINT IF EXISTS job_applications_job_id_fkey;

-- Ensure the public submission path remains available after older migrations.
GRANT USAGE ON SCHEMA public TO anon;
GRANT INSERT ON public.job_applications TO anon;

DROP POLICY IF EXISTS "Public insert job_applications" ON public.job_applications;
DROP POLICY IF EXISTS "Allow public insert on job_applications" ON public.job_applications;

CREATE POLICY "Public insert job_applications"
ON public.job_applications
FOR INSERT
TO public
WITH CHECK (true);

NOTIFY pgrst, 'reload schema';
