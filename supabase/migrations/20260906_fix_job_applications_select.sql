-- Fix Careers application persistence after refresh.
-- Public candidates INSERT applications; only authenticated admins need to READ them.
-- The frontend already loads applications with the logged-in admin Supabase session.

GRANT SELECT ON public.job_applications TO authenticated;

DROP POLICY IF EXISTS "Authenticated admins can read job_applications" ON public.job_applications;
CREATE POLICY "Authenticated admins can read job_applications"
ON public.job_applications
FOR SELECT
TO authenticated
USING (true);

NOTIFY pgrst, 'reload schema';
