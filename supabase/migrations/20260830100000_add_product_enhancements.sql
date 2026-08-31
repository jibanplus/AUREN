/*
# Add Product Enhancements

1. Overview
   Adds additional fields to products table for enhanced product management:
   - brand, sku, material, weight, colors, tags
   - is_featured, is_new flags
   - rating, review_count
   - image_urls for multiple images
   - SEO fields (seo_title, seo_description)

2. Modified Tables
   - products: added 13 new columns
*/

-- ============================================================
-- ADD NEW COLUMNS TO PRODUCTS TABLE
-- ============================================================

DO $$
BEGIN
  -- Add new columns if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'products' AND column_name = 'brand') THEN
    ALTER TABLE products ADD COLUMN brand text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'products' AND column_name = 'sku') THEN
    ALTER TABLE products ADD COLUMN sku text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'products' AND column_name = 'material') THEN
    ALTER TABLE products ADD COLUMN material text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'products' AND column_name = 'weight') THEN
    ALTER TABLE products ADD COLUMN weight text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'products' AND column_name = 'colors') THEN
    ALTER TABLE products ADD COLUMN colors text[] DEFAULT '{}';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'products' AND column_name = 'tags') THEN
    ALTER TABLE products ADD COLUMN tags text[] DEFAULT '{}';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'products' AND column_name = 'is_featured') THEN
    ALTER TABLE products ADD COLUMN is_featured boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'products' AND column_name = 'is_new') THEN
    ALTER TABLE products ADD COLUMN is_new boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'products' AND column_name = 'rating') THEN
    ALTER TABLE products ADD COLUMN rating numeric(2,1) DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'products' AND column_name = 'review_count') THEN
    ALTER TABLE products ADD COLUMN review_count integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'products' AND column_name = 'image_urls') THEN
    ALTER TABLE products ADD COLUMN image_urls text[] DEFAULT '{}';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'products' AND column_name = 'seo_title') THEN
    ALTER TABLE products ADD COLUMN seo_title text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'products' AND column_name = 'seo_description') THEN
    ALTER TABLE products ADD COLUMN seo_description text;
  END IF;
END $$;

-- ============================================================
-- CREATE INDEXES FOR NEW COLUMNS
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_new ON products(is_new);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);