-- The public Careers form can INSERT into job_applications, but the
-- resurrection-protection trigger also reads deleted_application_ids.
-- Make the trigger SECURITY DEFINER so anonymous submissions do not need
-- direct SELECT access to the internal deleted-id table.

CREATE OR REPLACE FUNCTION public.block_deleted_application_resurrection()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.deleted_application_ids d
    WHERE d.id = NEW.id
  ) THEN
    RETURN NULL;
  END IF;

  RETURN NEW;
END;
$$;
