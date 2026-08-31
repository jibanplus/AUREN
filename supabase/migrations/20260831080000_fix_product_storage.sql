-- Fix product image uploads. Run this once in Supabase SQL Editor.
-- Safe: does not alter/delete existing product data.

INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "public_read_product_images" ON storage.objects;
DROP POLICY IF EXISTS "anon_insert_product_images" ON storage.objects;
DROP POLICY IF EXISTS "anon_update_product_images" ON storage.objects;
DROP POLICY IF EXISTS "anon_delete_product_images" ON storage.objects;

CREATE POLICY "public_read_product_images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY "anon_insert_product_images"
ON storage.objects FOR INSERT TO anon, authenticated
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "anon_update_product_images"
ON storage.objects FOR UPDATE TO anon, authenticated
USING (bucket_id = 'product-images')
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "anon_delete_product_images"
ON storage.objects FOR DELETE TO anon, authenticated
USING (bucket_id = 'product-images');
