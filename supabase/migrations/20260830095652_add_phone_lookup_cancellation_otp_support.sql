/*
# Add Phone Lookup, Cancellation Columns, and Update Profile Trigger

1. Overview
   Adds support for login-by-phone, order cancellation tracking, and storing
   phone number during signup. Enables the new authentication and admin
   user-management features.

2. New Functions
   - phone_exists(text): checks if a phone number is already registered.
   - get_email_by_phone(text): returns the email associated with a phone
     number, so users can login with phone instead of email.

3. Modified Tables
   - orders: added nullable cancellation_reason (text) and cancelled_at
     (timestamptz) columns for tracking cancellation details.
   - handle_new_user trigger function updated to store phone from
     raw_user_meta_data during signup.

4. Security
   - phone_exists and get_email_by_phone are SECURITY DEFINER, executable
     by anon + authenticated (needed for pre-login checks).
   - No changes to existing RLS policies.
*/

-- ============================================================
-- 1. ADD CANCELLATION COLUMNS TO ORDERS
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'cancellation_reason') THEN
    ALTER TABLE orders ADD COLUMN cancellation_reason text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'cancelled_at') THEN
    ALTER TABLE orders ADD COLUMN cancelled_at timestamptz;
  END IF;
END $$;

-- ============================================================
-- 2. PHONE_EXISTS FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION public.phone_exists(phone_to_check text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE phone = phone_to_check AND phone_to_check != '');
$$;

-- ============================================================
-- 3. GET_EMAIL_BY_PHONE FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_email_by_phone(phone_input text)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email FROM public.profiles WHERE phone = phone_input AND phone_input != '' LIMIT 1;
$$;

-- ============================================================
-- 4. UPDATE HANDLE_NEW_USER TO STORE PHONE
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_count integer;
BEGIN
  SELECT COUNT(*) INTO user_count FROM public.profiles;
  INSERT INTO public.profiles (id, email, full_name, phone, is_admin)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    user_count = 0
  );
  RETURN NEW;
END;
$$;

-- ============================================================
-- 5. GRANTS
-- ============================================================
GRANT EXECUTE ON FUNCTION public.phone_exists(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_email_by_phone(text) TO anon, authenticated;