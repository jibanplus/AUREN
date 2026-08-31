-- Add source tracking fields to products table
-- This allows tracking where products were imported from (e.g., indiamart, manual)

ALTER TABLE products
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS source_product_id TEXT;

-- Add index for faster duplicate detection
CREATE INDEX IF NOT EXISTS idx_products_source_product_id ON products(source_product_id) WHERE source_product_id IS NOT NULL;
