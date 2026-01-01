-- ================================================
-- FIX: Manually create admin_users record for existing user
-- ================================================
-- This script addresses the issue where a user exists in auth.users
-- but not in admin_users (trigger didn't fire or wasn't set up yet)

-- Step 1: Insert the missing admin_users record
-- Replace the user_id and email with the actual values from auth.users
INSERT INTO public.admin_users (user_id, email, role, full_name, is_active)
SELECT
  id as user_id,
  email,
  'admin' as role,
  COALESCE(raw_user_meta_data->>'full_name', email) as full_name,
  true as is_active
FROM auth.users
WHERE id = 'f3af09e0-2c82-4e2e-bcdf-a0511569b830'
ON CONFLICT (user_id) DO NOTHING;

-- Step 2: Verify the trigger exists and is enabled
-- Check if the trigger function exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user'
  ) THEN
    RAISE NOTICE 'WARNING: handle_new_user() function does not exist!';
  ELSE
    RAISE NOTICE 'OK: handle_new_user() function exists';
  END IF;
END $$;

-- Check if the trigger exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'on_auth_user_created'
  ) THEN
    RAISE NOTICE 'WARNING: on_auth_user_created trigger does not exist!';
  ELSE
    RAISE NOTICE 'OK: on_auth_user_created trigger exists';
  END IF;
END $$;

-- Step 3: Recreate the trigger to ensure it's working
-- (This is safe to run multiple times)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.admin_users (user_id, email, role, full_name, is_active)
  VALUES (
    NEW.id,
    NEW.email,
    'admin',
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    true
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Step 4: Find any other users missing from admin_users
-- This will show you if there are other affected users
SELECT
  au.id,
  au.email,
  au.created_at,
  'Missing from admin_users' as status
FROM auth.users au
LEFT JOIN public.admin_users pu ON au.id = pu.user_id
WHERE pu.user_id IS NULL;

-- Step 5: Fix ALL missing users (optional - uncomment to run)
-- INSERT INTO public.admin_users (user_id, email, role, full_name, is_active)
-- SELECT
--   au.id as user_id,
--   au.email,
--   'admin' as role,
--   COALESCE(au.raw_user_meta_data->>'full_name', au.email) as full_name,
--   true as is_active
-- FROM auth.users au
-- LEFT JOIN public.admin_users pu ON au.id = pu.user_id
-- WHERE pu.user_id IS NULL
-- ON CONFLICT (user_id) DO NOTHING;
