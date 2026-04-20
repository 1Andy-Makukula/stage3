-- Migration: Identity Layer Hardening & KGCC Role Enforcement
-- Ensures public.profiles is strictly typed and constrained.

-- 1. Add Role Check Constraint
ALTER TABLE public.profiles 
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles 
  ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('customer', 'merchant', 'admin'));

-- 2. Ensure Role Default
ALTER TABLE public.profiles 
  ALTER COLUMN role SET DEFAULT 'customer';

-- 3. Identity Trace: Manual Promotion Placeholder
-- NOTE: Run this command manually in the Supabase SQL Editor with your email:
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'YOUR_EMAIL@GMAIL.COM';

COMMENT ON COLUMN public.profiles.role IS 'The platform role of the user (customer, merchant, admin). Restricted access via KGCC requires admin role.';
