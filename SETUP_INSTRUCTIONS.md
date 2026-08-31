# AdminPanel Products Tab - Setup Instructions

## Changes Made

### 1. Database Schema Updates
- Created migration: `20260830104000_update_products_with_supplier_and_images.sql`
- Added `supplier_id` foreign key to products table
- Added `image_urls` array for multiple product images
- Added `indiamart_url` field to both products and suppliers tables

### 2. Type Definitions Updated (`src/lib/types.ts`)
- Updated `Product` interface with new fields:
  - `image_urls: string[]`
  - `supplier_id: string | null`
  - `indiamart_url: string | null`
  - `created_at: string`
- Updated `Supplier` interface with:
  - `indiamart_url: string | null`
  - `created_at: string`
- Updated `Order` interface with cancellation fields

### 3. Store Functions Added (`src/lib/store.ts`)
- `fetchSuppliers()` - Fetch all suppliers
- `upsertSupplier()` - Create/update supplier
- `deleteSupplier()` - Delete supplier
- `uploadProductImage()` - Upload image to Supabase Storage

### 4. AdminPanel Products Tab Completely Rewritten
- **ProductsTab** now includes:
  - Supplier management (Add Supplier button)
  - Product listing with supplier info
  - Edit/Delete functionality

- **ProductEditor** with 4 tabs:
  - **Basic Info**: Product name, description, category
  - **Pricing**: Supplier price, selling price, profit margin calculation
  - **Supplier**: Select supplier from dropdown, supplier name, IndiaMART URL, supplier URL
  - **Images**: Main image upload to Supabase Storage, additional image URLs

- **SupplierEditor**: New modal to add suppliers with:
  - Name, phone, address
  - IndiaMART URL
  - Rating

## Required Setup Steps

### Step 1: Run Database Migration

You need to run the new migration in your Supabase project:

**Option A: Using Supabase Dashboard**
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the contents of `supabase/migrations/20260830104000_update_products_with_supplier_and_images.sql`
4. Paste and run the SQL

**Option B: Using Supabase CLI**
```bash
supabase db push
```

### Step 2: Create Storage Bucket for Product Images

You need to create a storage bucket named `product-images` in Supabase:

**Using Supabase Dashboard:**
1. Go to Storage section in your Supabase dashboard
2. Click "Create a new bucket"
3. Name it: `product-images`
4. Make it public (or configure appropriate policies)
5. Set up RLS policies to allow authenticated users to upload

**SQL to create bucket and policies:**
```sql
-- Create bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true);

-- Allow authenticated users to upload
CREATE POLICY "Authenticated can upload" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'product-images');

-- Allow public to view
CREATE POLICY "Public can view" 
ON storage.objects FOR SELECT 
TO anon, authenticated 
USING (bucket_id = 'product-images');
```

### Step 3: Update Existing Products (Optional)

If you have existing products, you may need to update them to match the new schema. The migration adds new columns with default values, but you might want to:

1. Update product names from `title` to `name` field
2. Update image URLs from `image_url` to `image` field
3. Set default `image_urls` array
4. Add supplier information

## Features Implemented

✅ Add Product with all required fields
✅ Product image upload to Supabase Storage
✅ Supplier selection from dropdown
✅ Add new suppliers
✅ IndiaMART supplier URL field
✅ Supplier price field
✅ Selling price field
✅ Stock management
✅ Category selection
✅ Product details/description
✅ Edit product functionality
✅ Delete product functionality
✅ Multiple image URLs support
✅ Profit margin calculation

## Usage

1. **Add Supplier**: Click "Add Supplier" button to add a new supplier first
2. **Add Product**: Click "New Product" to add a product
3. **Fill Details**: Complete all tabs in the product editor
4. **Upload Image**: Use the upload button or paste image URL
5. **Save**: Click "Save Product" to save to Supabase

## Notes

- Image upload requires Supabase Storage to be configured
- All operations are connected to Supabase when configured
- Falls back to localStorage/demo mode if Supabase is not configured
- The migration is backward compatible with existing data
