# IndiaMART Integration - Setup Guide

## Overview

This integration allows admin users to search and import products from IndiaMART directly into the AUREN e-commerce platform. The integration uses the Anakin API to search IndiaMART and imports products into Supabase.

## Architecture

```
Admin Panel → IndiaMART Import Tab → Serverless API (/api/indiamart/search) → Anakin API → IndiaMART
                                                                              ↓
                                                                          Results
                                                                              ↓
Admin clicks Import → Duplicate Check → Supplier Create/Reuse → Save to Supabase
```

**Important Security Notes:**
- ANAKIN_API_KEY is stored server-side only (never exposed to browser)
- Customers never call IndiaMART/Anakin API
- Customer site queries Supabase only
- API credits are only consumed when admin searches/imports

## Files Changed

### 1. Database Migration
**File:** `supabase/migrations/20260830220000_add_source_to_products.sql`

Added fields to track product source:
- `source` - 'manual' or 'indiamart'
- `source_product_id` - IndiaMART product ID for duplicate detection
- Index on `source_product_id` for fast duplicate checking

### 2. Type Definitions
**File:** `src/lib/types.ts`

Updated `Product` interface:
```typescript
export interface Product {
  // ... existing fields
  source: 'manual' | 'indiamart';
  source_product_id: string | null;
}
```

### 3. Store Functions
**File:** `src/lib/store.ts`

Updated seed data to include new `source` and `source_product_id` fields for all products.

### 4. API Route
**File:** `api/indiamart/search.ts`

Serverless function that:
- Accepts POST requests with search query
- Calls Anakin API with server-side ANAKIN_API_KEY
- Transforms IndiaMART response to our format
- Handles errors (401, 429, 503)
- Returns standardized product results

### 5. Vercel Configuration
**File:** `vercel.json`

Added API route rewrite:
```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    },
    // ... existing rewrites
  ]
}
```

### 6. Admin Panel
**File:** `src/components/AdminPanel.tsx`

Added:
- New tab: "IndiaMART Import" with Globe icon
- `IndiaMARTTab` component with:
  - Search input with Enter key support
  - Loading states
  - Error handling
  - Results grid with product cards
  - Import button per product
  - Duplicate detection
  - Supplier creation/reuse logic
  - Category auto-detection based on search query
  - Default 50% markup on supplier price
- IndiaMART badge on imported products in Products tab

## Environment Variables Required

Add to your Vercel environment variables:

```
ANAKIN_API_KEY=your_anakin_api_key_here
```

**Important:**
- Do NOT prefix with `VITE_` (this would expose it to browser)
- Set in Vercel dashboard under Settings → Environment Variables
- Or add to `.env` file for local development (but never commit)

## Setup Steps

### 1. Run Database Migration

**Option A: Supabase Dashboard**
1. Go to your Supabase project
2. Navigate to SQL Editor
3. Copy contents of `supabase/migrations/20260830220000_add_source_to_products.sql`
4. Run the SQL

**Option B: Supabase CLI**
```bash
supabase db push
```

### 2. Set Environment Variable

**For Vercel Deployment:**
1. Go to Vercel project settings
2. Add `ANAKIN_API_KEY` with your Anakin API key
3. Redeploy

**For Local Development:**
1. Create `.env` file in project root:
```
ANAKIN_API_KEY=your_anakin_api_key_here
```
2. Ensure `.env` is in `.gitignore`

### 3. Deploy API Route

The API route at `api/indiamart/search.ts` will be automatically deployed when you push to Vercel.

### 4. Test the Integration

1. Open Admin Panel
2. Click "IndiaMART Import" tab
3. Enter search query (e.g., "women kurti")
4. Click Search
5. Review results
6. Click Import on a product
7. Verify product appears in Products tab with IndiaMART badge

## Features Implemented

### Search Functionality
- Real-time search via Anakin API
- Loading state during search
- Error handling with user-friendly messages
- Empty state with instructions

### Import Functionality
- Duplicate detection using `source_product_id`
- Supplier reuse (checks existing suppliers by name)
- Supplier auto-creation if not exists
- Category auto-detection based on search keywords
- Default 50% markup on supplier price
- Default stock of 50 units
- Image URL preservation
- IndiaMART URL preservation

### Product Display
- IndiaMART badge on imported products
- Supplier name display
- Original price (supplier price) preserved
- Selling price separate from supplier price
- Profit margin calculation in Product Editor

### Security
- ANAKIN_API_KEY server-side only
- CORS enabled for API route
- No API key exposure to browser
- Customer site never calls IndiaMART API

## API Response Format

The Anakin API response is transformed to:

```typescript
interface IndiaMARTSearchResult {
  id: string;              // IndiaMART product ID
  name: string;            // Product name
  image: string;           // Product image URL
  supplier_name: string;  // Supplier name
  supplier_price: number; // Supplier price
  category?: string;       // Product category (if available)
  description?: string;    // Product description (if available)
  supplier_url?: string;   // Supplier URL (if available)
  indiamart_url?: string;  // IndiaMART product URL (if available)
}
```

## Error Handling

The system handles:
- Invalid API key → "Server configuration error"
- API rate limit (429) → "API rate limit exceeded"
- API unavailable (503) → "IndiaMART API temporarily unavailable"
- No products found → "No products found"
- Duplicate product → "Product already exists"
- Import failure → "Failed to import product"

## Limitations

1. **Anakin API Response Structure**: The transformation logic handles multiple possible response field names, but may need adjustment based on actual Anakin API response format.

2. **Category Detection**: Simple keyword-based detection (men/women/trendy). May need refinement for better accuracy.

3. **Default Values**: 
   - Default 50% markup may not suit all products
   - Default stock of 50 may need adjustment
   - Supplier phone/address are empty on auto-creation

4. **Image Handling**: Currently stores IndiaMART image URLs. Does not download/rehost images (to respect terms of service).

## Testing Checklist

- [ ] Admin can search IndiaMART products
- [ ] Search does not expose API key
- [ ] Admin can import a product
- [ ] Imported product appears in Supabase
- [ ] Supplier is created/reused correctly
- [ ] Duplicate import is prevented
- [ ] Imported product appears on customer website
- [ ] Customer product search does NOT call IndiaMART API
- [ ] Existing products still work
- [ ] Existing Admin Panel functions still work
- [ ] IndiaMART badge shows on imported products
- [ ] Supplier price is preserved separately from selling price

## Future Enhancements

1. **Product Details Fetch**: Add API route to fetch detailed product information using `idm_product_detail`

2. **Supplier Profile**: Add API route to fetch supplier details using `idm_supplier_profile`

3. **Bulk Import**: Allow importing multiple products at once

4. **Image Download**: Optional server-side image download/rehosting if terms permit

5. **Price Rules**: Configurable markup rules by category

6. **Stock Sync**: Optional stock synchronization with IndiaMART

## Support

If you encounter issues:

1. Check Vercel deployment logs for API route errors
2. Verify ANAKIN_API_KEY is set correctly
3. Check Supabase migration was applied
4. Verify network connectivity to Anakin API
5. Check browser console for frontend errors

## API Documentation Reference

Refer to current Anakin API documentation for:
- Correct endpoint: `https://api.anakin.ai/v1/actions/idm_search`
- Request/response format
- Rate limits
- Authentication method


## Local preview fix
For `npm run dev`, the Vite dev server now provides `/api/indiamart/search` locally, so you do not need a separate API server. Put `ANAKIN_API_KEY=...` in `.env.local` (without the `VITE_` prefix), restart `npm run dev`, and test the IndiaMART tab.

## Product image upload fix
Run `supabase/migrations/20260831080000_fix_product_storage.sql` once in Supabase SQL Editor. It creates the `product-images` bucket and the required storage policies without deleting existing products.
