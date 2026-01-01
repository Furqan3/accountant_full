-- ================================================================
-- MIGRATION: Remove avatar_url column from profiles and admin_users
-- ================================================================
-- Run this in Supabase SQL Editor if you already have existing tables
-- This will remove the avatar feature from your application
-- ================================================================

-- Remove avatar_url from profiles table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'profiles'
    AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE public.profiles DROP COLUMN avatar_url;
    RAISE NOTICE 'Removed avatar_url column from profiles table';
  ELSE
    RAISE NOTICE 'avatar_url column does not exist in profiles table';
  END IF;
END $$;

-- Remove avatar_url from admin_users table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'admin_users'
    AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE public.admin_users DROP COLUMN avatar_url;
    RAISE NOTICE 'Removed avatar_url column from admin_users table';
  ELSE
    RAISE NOTICE 'avatar_url column does not exist in admin_users table';
  END IF;
END $$;

-- ================================================================
-- DONE!
-- ================================================================
-- The avatar_url columns have been removed from both tables
-- Your application will now use initial-based avatars instead
-- ================================================================
