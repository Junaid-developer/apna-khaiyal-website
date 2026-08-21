-- =========================================================================
-- SUPABASE MIGRATION: AUTOMATED ADMIN TRIGGER ON AUTH.USERS
-- Automatically creates a public.admins record whenever a user signs up.
-- =========================================================================

-- 1. Create Security Definer Trigger Function
CREATE OR REPLACE FUNCTION public.handle_new_admin_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Automatically insert into public.admins when a new user registers in auth.users
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

  -- Maintain backward compatibility in public.admin_roles
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

-- 2. Grant permissions to execute function
GRANT EXECUTE ON FUNCTION public.handle_new_admin_user() TO service_role, postgres, anon, authenticated;

-- 3. Create Trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_admin_user();
