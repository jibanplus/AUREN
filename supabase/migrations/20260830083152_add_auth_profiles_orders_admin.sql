/*
# Add Authentication: Profiles, Orders user_id, Admin Functions

1. Overview
   Adds full user authentication. Creates profiles table linked to auth.users,
   adds user_id to orders, auto-creates profile on signup, admin helper functions.

2. New Tables
   - profiles: id (uuid FK auth.users), email, full_name, phone, address,
     pincode, is_admin, created_at. First registered user becomes admin.

3. Modified Tables
   - orders: added nullable user_id column.

4. New Functions
   - is_admin(), email_exists(text), fetch_all_users(), handle_new_user()

5. Security
   - profiles RLS: users read/update own, admin reads all.
   - orders RLS: users see own orders, admin sees all + updates status.
   - products/coupons/offers: keep anon+authenticated read for browsing.
*/

-- ============================================================
-- 1. CREATE PROFILES TABLE (must exist before functions)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL DEFAULT '',
  full_name text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  pincode text NOT NULL DEFAULT '',
  is_admin boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 2. CREATE FUNCTIONS (table now exists)
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true);
$$;

CREATE OR REPLACE FUNCTION public.email_exists(email_to_check text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE email = email_to_check);
$$;

CREATE OR REPLACE FUNCTION public.phone_exists(phone_to_check text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE phone = phone_to_check);
$$;

CREATE OR REPLACE FUNCTION public.get_email_by_phone(phone_input text)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email FROM public.profiles WHERE phone = phone_input LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.fetch_all_users()
RETURNS TABLE (
  id uuid,
  email text,
  full_name text,
  phone text,
  address text,
  pincode text,
  is_admin boolean,
  created_at timestamptz,
  order_count bigint,
  total_spent numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: admin only';
  END IF;
  RETURN QUERY
    SELECT
      p.id, p.email, p.full_name, p.phone, p.address, p.pincode, p.is_admin, p.created_at,
      COALESCE(o.order_count, 0) AS order_count,
      COALESCE(o.total_spent, 0) AS total_spent
    FROM public.profiles p
    LEFT JOIN (
      SELECT user_id, COUNT(*) AS order_count, SUM(total) AS total_spent
      FROM public.orders
      WHERE status != 'Cancelled'
      GROUP BY user_id
    ) o ON o.user_id = p.id
    ORDER BY p.created_at DESC;
END;
$$;

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
  INSERT INTO public.profiles (id, email, full_name, is_admin)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    user_count = 0
  );
  RETURN NEW;
END;
$$;

-- ============================================================
-- 3. PROFILES POLICIES (functions now exist)
-- ============================================================
DROP POLICY IF EXISTS "select_own_or_admin_profile" ON profiles;
CREATE POLICY "select_own_or_admin_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

-- ============================================================
-- 4. ADD user_id TO ORDERS
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'user_id') THEN
    ALTER TABLE orders ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ============================================================
-- 5. UPDATE ORDERS RLS
-- ============================================================
DROP POLICY IF EXISTS "anon_select_orders" ON orders;
DROP POLICY IF EXISTS "anon_insert_orders" ON orders;
DROP POLICY IF EXISTS "anon_update_orders" ON orders;
DROP POLICY IF EXISTS "anon_delete_orders" ON orders;

DROP POLICY IF EXISTS "select_own_or_all_orders" ON orders;
CREATE POLICY "select_own_or_all_orders" ON orders FOR SELECT
  TO authenticated USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "insert_own_orders" ON orders;
CREATE POLICY "insert_own_orders" ON orders FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_orders_admin" ON orders;
CREATE POLICY "update_orders_admin" ON orders FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "delete_orders_admin" ON orders;
CREATE POLICY "delete_orders_admin" ON orders FOR DELETE
  TO authenticated USING (public.is_admin());

-- ============================================================
-- 6. TRIGGER
-- ============================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 7. GRANTS
-- ============================================================
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.email_exists(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.phone_exists(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_email_by_phone(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.fetch_all_users() TO authenticated;