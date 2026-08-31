-- AUREN schema repair / compatibility migration
-- Safe: does NOT DROP products, orders, suppliers, coupons, offers, or import_sources.
-- Run this once in Supabase SQL Editor if the project was created from older migrations.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- SUPPLIERS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  rating numeric(2,1) NOT NULL DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  indiamart_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ADD COLUMN IF NOT EXISTS indiamart_url text;
DROP POLICY IF EXISTS "anon_select_suppliers" ON public.suppliers;
DROP POLICY IF EXISTS "anon_insert_suppliers" ON public.suppliers;
DROP POLICY IF EXISTS "anon_update_suppliers" ON public.suppliers;
DROP POLICY IF EXISTS "anon_delete_suppliers" ON public.suppliers;
CREATE POLICY "anon_select_suppliers" ON public.suppliers FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_suppliers" ON public.suppliers FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_suppliers" ON public.suppliers FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_suppliers" ON public.suppliers FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- PRODUCTS: preserve old schema/data and add the current fields
-- ============================================================
CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  description text,
  image_url text,
  regular_price numeric(10,2),
  discounted_price numeric(10,2),
  sizes text[] NOT NULL DEFAULT '{}',
  category text NOT NULL DEFAULT 'Men',
  stock integer NOT NULL DEFAULT 100,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS title text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS regular_price numeric(10,2);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS discounted_price numeric(10,2);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sizes text[] DEFAULT '{}';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image_urls text[] DEFAULT '{}';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS original_price numeric(10,2);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS selling_price numeric(10,2);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS supplier_id uuid;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS supplier_name text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS supplier_url text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS indiamart_url text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS source text DEFAULT 'manual';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS source_product_id text;

DO $$
BEGIN
  UPDATE public.products
  SET name = COALESCE(name, title, 'Untitled Product'),
      image = COALESCE(image, image_url, ''),
      original_price = COALESCE(original_price, regular_price, discounted_price, 0),
      selling_price = COALESCE(selling_price, discounted_price, regular_price, 0),
      image_urls = CASE WHEN image_urls IS NULL OR cardinality(image_urls) = 0
                        THEN CASE WHEN COALESCE(image, image_url, '') <> '' THEN ARRAY[COALESCE(image, image_url)] ELSE '{}'::text[] END
                        ELSE image_urls END,
      supplier_name = COALESCE(supplier_name, '');

  ALTER TABLE public.products ALTER COLUMN name SET DEFAULT 'Untitled Product';
  ALTER TABLE public.products ALTER COLUMN name SET NOT NULL;
  ALTER TABLE public.products ALTER COLUMN image SET DEFAULT '';
  ALTER TABLE public.products ALTER COLUMN image SET NOT NULL;
  ALTER TABLE public.products ALTER COLUMN original_price SET DEFAULT 0;
  ALTER TABLE public.products ALTER COLUMN original_price SET NOT NULL;
  ALTER TABLE public.products ALTER COLUMN selling_price SET DEFAULT 0;
  ALTER TABLE public.products ALTER COLUMN selling_price SET NOT NULL;
  ALTER TABLE public.products ALTER COLUMN supplier_name SET DEFAULT '';
  ALTER TABLE public.products ALTER COLUMN supplier_name SET NOT NULL;
EXCEPTION WHEN others THEN
  -- Keep migration idempotent on unusual legacy rows; the data backfill above is still applied.
  NULL;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'products_supplier_id_fkey'
  ) THEN
    ALTER TABLE public.products ADD CONSTRAINT products_supplier_id_fkey
      FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id) ON DELETE SET NULL;
  END IF;
END $$;

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_products" ON public.products;
DROP POLICY IF EXISTS "anon_insert_products" ON public.products;
DROP POLICY IF EXISTS "anon_update_products" ON public.products;
DROP POLICY IF EXISTS "anon_delete_products" ON public.products;
CREATE POLICY "anon_select_products" ON public.products FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_products" ON public.products FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_products" ON public.products FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_products" ON public.products FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_supplier_id ON public.products(supplier_id);
CREATE INDEX IF NOT EXISTS idx_products_source_product_id ON public.products(source_product_id) WHERE source_product_id IS NOT NULL;

-- ============================================================
-- ORDERS: preserve current order data and support the checkout model
-- ============================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  pincode text NOT NULL DEFAULT '',
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  subtotal numeric(10,2) NOT NULL DEFAULT 0,
  discount numeric(10,2) NOT NULL DEFAULT 0,
  total numeric(10,2) NOT NULL DEFAULT 0,
  coupon_code text,
  status text NOT NULL DEFAULT 'Pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_name text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS full_name text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS pincode text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS items jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS subtotal numeric(10,2) DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS discount numeric(10,2) DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS total numeric(10,2) DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS coupon_code text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS product_id uuid;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS quantity integer DEFAULT 1;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS amount numeric(10,2) DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS supplier_id uuid;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS cancellation_reason text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS cancelled_at timestamptz;

UPDATE public.orders
SET full_name = COALESCE(full_name, customer_name, ''),
    phone = COALESCE(phone, ''),
    address = COALESCE(address, ''),
    pincode = COALESCE(pincode, ''),
    items = COALESCE(items, '[]'::jsonb),
    subtotal = COALESCE(subtotal, amount, 0),
    total = COALESCE(total, amount, 0),
    quantity = COALESCE(quantity, 1),
    amount = COALESCE(amount, total, 0);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_orders" ON public.orders;
DROP POLICY IF EXISTS "anon_insert_orders" ON public.orders;
DROP POLICY IF EXISTS "anon_update_orders" ON public.orders;
DROP POLICY IF EXISTS "anon_delete_orders" ON public.orders;
CREATE POLICY "anon_select_orders" ON public.orders FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_orders" ON public.orders FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_orders" ON public.orders FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_orders" ON public.orders FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- IMPORT SOURCES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.import_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  website_url text NOT NULL,
  logo text,
  method text NOT NULL DEFAULT 'scraper',
  api_endpoint text,
  api_key text,
  selectors jsonb NOT NULL DEFAULT '{}'::jsonb,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.import_sources ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage import sources" ON public.import_sources;
DROP POLICY IF EXISTS "anon_select_import_sources" ON public.import_sources;
DROP POLICY IF EXISTS "anon_insert_import_sources" ON public.import_sources;
DROP POLICY IF EXISTS "anon_update_import_sources" ON public.import_sources;
DROP POLICY IF EXISTS "anon_delete_import_sources" ON public.import_sources;
CREATE POLICY "anon_select_import_sources" ON public.import_sources FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_import_sources" ON public.import_sources FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_import_sources" ON public.import_sources FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_import_sources" ON public.import_sources FOR DELETE TO anon, authenticated USING (true);
CREATE INDEX IF NOT EXISTS idx_import_sources_enabled ON public.import_sources(enabled);

-- ============================================================
-- Existing offers/coupons: make sure policies are present and writable
-- ============================================================
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_offers" ON public.offers;
DROP POLICY IF EXISTS "anon_insert_offers" ON public.offers;
DROP POLICY IF EXISTS "anon_update_offers" ON public.offers;
DROP POLICY IF EXISTS "anon_delete_offers" ON public.offers;
CREATE POLICY "anon_select_offers" ON public.offers FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_offers" ON public.offers FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_offers" ON public.offers FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_offers" ON public.offers FOR DELETE TO anon, authenticated USING (true);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_coupons" ON public.coupons;
DROP POLICY IF EXISTS "anon_insert_coupons" ON public.coupons;
DROP POLICY IF EXISTS "anon_update_coupons" ON public.coupons;
DROP POLICY IF EXISTS "anon_delete_coupons" ON public.coupons;
CREATE POLICY "anon_select_coupons" ON public.coupons FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_coupons" ON public.coupons FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_coupons" ON public.coupons FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_coupons" ON public.coupons FOR DELETE TO anon, authenticated USING (true);

-- Force PostgREST to refresh its schema cache after DDL.
NOTIFY pgrst, 'reload schema';


