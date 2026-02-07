-- ==========================================
-- SUPER ADMIN CONTROL PANEL SETUP
-- Run this in your Supabase SQL Editor via Management API
-- ==========================================

-- 0. Enable pgcrypto (Required for passwords)
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA extensions;

-- 1. Helper Function to Check Admin Role (Prevents Recursion)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  current_role text;
BEGIN
  -- Check if the user has the 'admin' role in the profiles table
  SELECT role INTO current_role FROM public.profiles WHERE id = auth.uid();
  RETURN current_role = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Grant FULL Access to Admins on PROFILES
DROP POLICY IF EXISTS "Admins can do everything on profiles" ON profiles;
CREATE POLICY "Admins can do everything on profiles"
  ON profiles
  FOR ALL
  USING ( is_admin() )
  WITH CHECK ( is_admin() );

-- 3. Grant FULL Access to Admins on TRANSACTIONS
DROP POLICY IF EXISTS "Admins can do everything on transactions" ON transactions;
CREATE POLICY "Admins can do everything on transactions"
  ON transactions
  FOR ALL
  USING ( is_admin() )
  WITH CHECK ( is_admin() );

-- 4. Grant FULL Access to Admins on INVESTMENTS
DROP POLICY IF EXISTS "Admins can do everything on investments" ON investments;
CREATE POLICY "Admins can do everything on investments"
  ON investments
  FOR ALL
  USING ( is_admin() )
  WITH CHECK ( is_admin() );

-- 5. FUNCTION: Delete User Completely (Auth + Data)
CREATE OR REPLACE FUNCTION public.delete_user_completely(target_user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Check if the executor is an admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Access Denied: Only Admins can delete users.';
  END IF;

  -- Delete from related tables (Explicit cleanup)
  DELETE FROM public.transactions WHERE user_id = target_user_id;
  DELETE FROM public.investments WHERE user_id = target_user_id;
  DELETE FROM public.profiles WHERE id = target_user_id;

  -- Delete from auth.users (Requires elevated privileges)
  DELETE FROM auth.users WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. FUNCTION: Reset User Password (Admin Override)
CREATE OR REPLACE FUNCTION public.admin_reset_password(target_user_id UUID, new_password TEXT)
RETURNS VOID AS $$
BEGIN
  -- Check if the executor is an admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Access Denied: Only Admins can reset passwords.';
  END IF;

  -- Update auth.users directly
  -- Uses pgcrypto to hash the password correctly for Supabase GoTrue (bcrypt)
  UPDATE auth.users
  SET encrypted_password = extensions.crypt(new_password, extensions.gen_salt('bf'))
  WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Fix existing policies that might conflict
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can view all transactions" ON transactions;
DROP POLICY IF EXISTS "Admins can update transactions" ON transactions;

-- Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;

-- Grant usage (just in case)
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
