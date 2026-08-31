# AUREN — Final repair before deploy

The source code has been repaired to use a non-destructive database schema. The previous supplier migration that dropped `products` and `orders` has been replaced.

## One required Supabase step

Open **Supabase → SQL Editor** for the same project used by the site and run the complete file:

`supabase/migrations/20260831070000_repair_all_admin_schema.sql`

Run it once. It is designed to be idempotent and does not drop existing products/orders.

The final statement refreshes PostgREST (`NOTIFY pgrst, 'reload schema'`) so the previous `404 Not Found` errors for `import_sources` and `suppliers` are cleared.

## Then

1. Refresh the local site with Ctrl+F5.
2. Test Admin → Offers & Banners → Save.
3. Test Admin → Coupons → Save.
4. Test Admin → Products → Save.
5. Test Admin → Products → Add Supplier.
6. Test Admin → Import Sources → Add Website.
7. Place a test order and use **Invoice PDF** → Print / Save PDF.

Existing manual products are not intentionally deleted by the repair migration.
