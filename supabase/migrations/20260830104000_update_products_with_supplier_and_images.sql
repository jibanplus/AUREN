/*
# Update Products Table with Supplier and Image Support

1. Overview
   - Add supplier_id foreign key to products table
   - Add image_urls array for multiple product images
   - Add indiamart_url field for supplier URL
   - Update suppliers table with indiamart_url field

2. Modified Tables
   - products: added supplier_id, image_urls, indiamart_url
   - suppliers: added indiamart_url
*/

-- ============================================================
-- UPDATE SUPPLIERS TABLE
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'suppliers' AND column_name = 'indiamart_url') THEN
    ALTER TABLE suppliers ADD COLUMN indiamart_url text;
  END IF;
END $$;

-- ============================================================
-- UPDATE PRODUCTS TABLE
-- ============================================================

DO $$
BEGIN
  -- Add supplier_id column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'products' AND column_name = 'supplier_id') THEN
    ALTER TABLE products ADD COLUMN supplier_id uuid REFERENCES suppliers(id) ON DELETE SET NULL;
  END IF;

  -- Add image_urls column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'products' AND column_name = 'image_urls') THEN
    ALTER TABLE products ADD COLUMN image_urls text[] DEFAULT '{}';
  END IF;

  -- Add indiamart_url column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'products' AND column_name = 'indiamart_url') THEN
    ALTER TABLE products ADD COLUMN indiamart_url text;
  END IF;
END $$;

-- ============================================================
-- CREATE INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_products_supplier_id ON products(supplier_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_indiamart ON suppliers(indiamart_url);

-- ============================================================
-- UPDATE RLS POLICIES
-- ============================================================

-- Ensure policies allow supplier_id updates
DROP POLICY IF EXISTS "anon_update_products" ON products;
CREATE POLICY "anon_update_products" ON products FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
