-- Quick fix for RLS policy issue
-- Run this in Supabase SQL Editor if you already ran the main schema

-- Drop all existing policies on admin_users to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own admin record" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can view all admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Super admins can insert admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Super admins can update admin users" ON public.admin_users;

-- Simple policy: Allow users to view their own admin record
CREATE POLICY "Users can view their own admin record" ON public.admin_users
  FOR SELECT
  USING (user_id = auth.uid());

-- Allow super admins to insert new admin users
CREATE POLICY "Super admins can insert admin users" ON public.admin_users
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid() OR
    (SELECT role FROM public.admin_users WHERE user_id = auth.uid() AND is_active = true) = 'super_admin'
  );

-- Allow super admins to update admin users
CREATE POLICY "Super admins can update admin users" ON public.admin_users
  FOR UPDATE
  USING (
    user_id = auth.uid() OR
    (SELECT role FROM public.admin_users WHERE user_id = auth.uid() AND is_active = true) = 'super_admin'
  );
