-- Supplier compatibility schema.
-- Intentionally non-destructive: never DROP products or orders.
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
DROP POLICY IF EXISTS "anon_select_suppliers" ON public.suppliers;
DROP POLICY IF EXISTS "anon_insert_suppliers" ON public.suppliers;
DROP POLICY IF EXISTS "anon_update_suppliers" ON public.suppliers;
DROP POLICY IF EXISTS "anon_delete_suppliers" ON public.suppliers;
CREATE POLICY "anon_select_suppliers" ON public.suppliers FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_suppliers" ON public.suppliers FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_suppliers" ON public.suppliers FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_suppliers" ON public.suppliers FOR DELETE TO anon, authenticated USING (true);
