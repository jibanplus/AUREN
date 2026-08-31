import { supabase, isSupabaseConfigured } from './supabase';
import type { Product, Coupon, Offer, Order, OrderStatus, Profile, AdminUser, Supplier , ImportSource } from './types';

const LS_KEYS = {
  products: 'auren_products',
  coupons: 'auren_coupons',
  offers: 'auren_offers',
  orders: 'auren_orders',
};

function readLS<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeLS<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore quota */
  }
}

// ---- Seed data for demo mode ----
const SEED_PRODUCTS: Product[] = [
  { id: 'p1', name: 'Oversized Knit Sweater', description: 'Relaxed-fit cotton blend sweater with ribbed cuffs.', image: 'https://images.pexels.com/photos/9558897/pexels-photo-9558897.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', image_urls: ['https://images.pexels.com/photos/9558897/pexels-photo-9558897.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'], original_price: 2499, selling_price: 1499, supplier_id: null, supplier_name: 'UrbanStyle', supplier_url: null, indiamart_url: null, stock: 100, category: 'Men', created_at: new Date().toISOString(), source: 'manual', source_product_id: null },
  { id: 'p2', name: 'Graphic Tee & Denim Set', description: 'Casual graphic tee paired with slim denim jeans.', image: 'https://images.pexels.com/photos/1389077/pexels-photo-1389077.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', image_urls: ['https://images.pexels.com/photos/1389077/pexels-photo-1389077.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'], original_price: 2999, selling_price: 1799, supplier_id: null, supplier_name: 'StreetWear', supplier_url: null, indiamart_url: null, stock: 100, category: 'Men', created_at: new Date().toISOString(), source: 'manual', source_product_id: null },
  { id: 'p3', name: 'Red Bomber Jacket', description: 'Lightweight bomber with zip closure and ribbed hem.', image: 'https://images.pexels.com/photos/16069733/pexels-photo-16069733.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', image_urls: ['https://images.pexels.com/photos/16069733/pexels-photo-16069733.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'], original_price: 3999, selling_price: 2599, supplier_id: null, supplier_name: 'FlightGear', supplier_url: null, indiamart_url: null, stock: 100, category: 'Men', created_at: new Date().toISOString(), source: 'manual', source_product_id: null },
  { id: 'p4', name: 'Black Turtleneck', description: 'Slim-fit turtleneck in soft stretch fabric.', image: 'https://images.pexels.com/photos/7828880/pexels-photo-7828880.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', image_urls: ['https://images.pexels.com/photos/7828880/pexels-photo-7828880.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'], original_price: 1999, selling_price: 1299, supplier_id: null, supplier_name: 'Essentials', supplier_url: null, indiamart_url: null, stock: 100, category: 'Men', created_at: new Date().toISOString(), source: 'manual', source_product_id: null },
  { id: 'p5', name: 'Pink Blazer', description: 'Tailored single-breasted blazer in blush pink.', image: 'https://images.pexels.com/photos/16069735/pexels-photo-16069735.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', image_urls: ['https://images.pexels.com/photos/16069735/pexels-photo-16069735.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'], original_price: 4999, selling_price: 3199, supplier_id: null, supplier_name: 'FormalFit', supplier_url: null, indiamart_url: null, stock: 100, category: 'Men', created_at: new Date().toISOString(), source: 'manual', source_product_id: null },
  { id: 'p6', name: 'Beige Wool Coat', description: 'Long-line wool blend coat with lapel collar.', image: 'https://images.pexels.com/photos/13885989/pexels-photo-13885989.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', image_urls: ['https://images.pexels.com/photos/13885989/pexels-photo-13885989.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'], original_price: 5999, selling_price: 3799, supplier_id: null, supplier_name: 'WinterWarm', supplier_url: null, indiamart_url: null, stock: 100, category: 'Men', created_at: new Date().toISOString(), source: 'manual', source_product_id: null },
  { id: 'p7', name: 'Black Evening Gown', description: 'Sequin-embellished evening gown with slit.', image: 'https://images.pexels.com/photos/14801160/pexels-photo-14801160.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', image_urls: ['https://images.pexels.com/photos/14801160/pexels-photo-14801160.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'], original_price: 6999, selling_price: 4499, supplier_id: null, supplier_name: 'Elegance', supplier_url: null, indiamart_url: null, stock: 100, category: 'Women', created_at: new Date().toISOString(), source: 'manual', source_product_id: null },
  { id: 'p8', name: 'City Black Dress', description: 'Sleek bodycon dress for everyday elegance.', image: 'https://images.pexels.com/photos/26102191/pexels-photo-26102191.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', image_urls: ['https://images.pexels.com/photos/26102191/pexels-photo-26102191.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'], original_price: 2999, selling_price: 1899, supplier_id: null, supplier_name: 'UrbanChic', supplier_url: null, indiamart_url: null, stock: 100, category: 'Women', created_at: new Date().toISOString(), source: 'manual', source_product_id: null },
  { id: 'p9', name: 'White Flowy Dress', description: 'Lightweight midi dress with flowing silhouette.', image: 'https://images.pexels.com/photos/20483777/pexels-photo-20483777.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', image_urls: ['https://images.pexels.com/photos/20483777/pexels-photo-20483777.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'], original_price: 3499, selling_price: 2199, supplier_id: null, supplier_name: 'SummerBreeze', supplier_url: null, indiamart_url: null, stock: 100, category: 'Women', created_at: new Date().toISOString(), source: 'manual', source_product_id: null },
  { id: 'p10', name: 'Lace Summer Dress', description: 'Delicate lace dress perfect for warm days.', image: 'https://images.pexels.com/photos/19306663/pexels-photo-19306663.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', image_urls: ['https://images.pexels.com/photos/19306663/pexels-photo-19306663.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'], original_price: 3299, selling_price: 2099, supplier_id: null, supplier_name: 'LaceLove', supplier_url: null, indiamart_url: null, stock: 100, category: 'Women', created_at: new Date().toISOString(), source: 'manual', source_product_id: null },
  { id: 'p11', name: 'Red Cocktail Dress', description: 'Bold red dress with tailored cut.', image: 'https://images.pexels.com/photos/9561596/pexels-photo-9561596.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', image_urls: ['https://images.pexels.com/photos/9561596/pexels-photo-9561596.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'], original_price: 3999, selling_price: 2599, supplier_id: null, supplier_name: 'Crimson', supplier_url: null, indiamart_url: null, stock: 100, category: 'Women', created_at: new Date().toISOString(), source: 'manual', source_product_id: null },
  { id: 'p12', name: 'Trench Coat Classic', description: 'Belted trench coat in neutral tone.', image: 'https://images.pexels.com/photos/31762864/pexels-photo-31762864.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', image_urls: ['https://images.pexels.com/photos/31762864/pexels-photo-31762864.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'], original_price: 5499, selling_price: 3499, supplier_id: null, supplier_name: 'ClassicWear', supplier_url: null, indiamart_url: null, stock: 100, category: 'Women', created_at: new Date().toISOString(), source: 'manual', source_product_id: null },
  { id: 'p13', name: 'Urban Streetwear Set', description: 'Oversized streetwear co-ord with cargo pants.', image: 'https://images.pexels.com/photos/16217479/pexels-photo-16217479.png?auto=compress&cs=tinysrgb&h=650&w=940', image_urls: ['https://images.pexels.com/photos/16217479/pexels-photo-16217479.png?auto=compress&cs=tinysrgb&h=650&w=940'], original_price: 3499, selling_price: 2299, supplier_id: null, supplier_name: 'StreetKing', supplier_url: null, indiamart_url: null, stock: 100, category: 'Trendy', created_at: new Date().toISOString(), source: 'manual', source_product_id: null },
  { id: 'p14', name: 'Night Street Outfit', description: 'Reflective streetwear for night-out styling.', image: 'https://images.pexels.com/photos/29660402/pexels-photo-29660402.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', image_urls: ['https://images.pexels.com/photos/29660402/pexels-photo-29660402.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'], original_price: 3299, selling_price: 1999, supplier_id: null, supplier_name: 'NightVision', supplier_url: null, indiamart_url: null, stock: 100, category: 'Trendy', created_at: new Date().toISOString(), source: 'manual', source_product_id: null },
  { id: 'p15', name: 'Vintage Street Jacket', description: 'Retro jacket with embroidered detailing.', image: 'https://images.pexels.com/photos/28304701/pexels-photo-28304701.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', image_urls: ['https://images.pexels.com/photos/28304701/pexels-photo-28304701.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'], original_price: 2799, selling_price: 1699, supplier_id: null, supplier_name: 'RetroVibe', supplier_url: null, indiamart_url: null, stock: 100, category: 'Trendy', created_at: new Date().toISOString(), source: 'manual', source_product_id: null },
  { id: 'p16', name: 'Urban Hoodie Look', description: 'Cropped hoodie with high-waist bottoms.', image: 'https://images.pexels.com/photos/7393316/pexels-photo-7393316.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', image_urls: ['https://images.pexels.com/photos/7393316/pexels-photo-7393316.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'], original_price: 2499, selling_price: 1599, supplier_id: null, supplier_name: 'HoodLife', supplier_url: null, indiamart_url: null, stock: 100, category: 'Trendy', created_at: new Date().toISOString(), source: 'manual', source_product_id: null },
];

const SEED_COUPONS: Coupon[] = [
  { id: 'c1', code: 'WELCOME10', discount_type: 'percentage', discount_value: 10, min_order_value: 0, expiry_date: '2026-12-31', is_active: true },
  { id: 'c2', code: 'FLAT200', discount_type: 'flat', discount_value: 200, min_order_value: 1500, expiry_date: '2026-12-31', is_active: true },
  { id: 'c3', code: 'SUMMER25', discount_type: 'percentage', discount_value: 25, min_order_value: 2000, expiry_date: '2026-12-31', is_active: true },
];

const SEED_OFFER: Offer = {
  id: 'o1',
  hero_title: 'End of Season Sale',
  hero_subtitle: 'Up to 60% off the latest arrivals',
  banner_tag: 'New Collection',
  promo_text: 'Free shipping on all orders above ₹999',
  is_active: true,
};

function initDemo() {
  if (!localStorage.getItem(LS_KEYS.products)) writeLS(LS_KEYS.products, SEED_PRODUCTS);
  if (!localStorage.getItem(LS_KEYS.coupons)) writeLS(LS_KEYS.coupons, SEED_COUPONS);
  if (!localStorage.getItem(LS_KEYS.offers)) writeLS(LS_KEYS.offers, [SEED_OFFER]);
  if (!localStorage.getItem(LS_KEYS.orders)) writeLS(LS_KEYS.orders, []);
}

// ============ PRODUCTS ============
// Keep PostgreSQL UUID primary keys valid. Existing products retain their IDs;
// newly created client-side products get a UUID before upsert.
function ensureProductId(id: string): string {
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuid.test(id) ? id : crypto.randomUUID();
}

export async function fetchProducts(): Promise<Product[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: true });
    if (error) throw error;
    return (data ?? []) as Product[];
  }
  initDemo();
  return readLS<Product[]>(LS_KEYS.products, SEED_PRODUCTS);
}

export async function upsertProduct(p: Product): Promise<Product> {
  const product = { ...p, id: ensureProductId(p.id) };
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('products').upsert(product).select().single();
    if (error) throw error;
    return data as Product;
  }
  const list = readLS<Product[]>(LS_KEYS.products, SEED_PRODUCTS);
  const idx = list.findIndex((x) => x.id === p.id);
  if (idx >= 0) list[idx] = p;
  else list.push(p);
  writeLS(LS_KEYS.products, list);
  return p;
}

export async function deleteProduct(id: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
    return;
  }
  const list = readLS<Product[]>(LS_KEYS.products, SEED_PRODUCTS).filter((x) => x.id !== id);
  writeLS(LS_KEYS.products, list);
}

// ============ IMPORT SOURCES ============
export async function fetchImportSources(): Promise<ImportSource[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('import_sources').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as ImportSource[];
  }
  return [];
}

export async function upsertImportSource(source: ImportSource): Promise<ImportSource> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('import_sources').upsert(source).select().single();
    if (error) throw error;
    return data as ImportSource;
  }
  throw new Error('Supabase is not configured');
}

export async function deleteImportSource(id: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('import_sources').delete().eq('id', id);
    if (error) throw error;
    return;
  }
  throw new Error('Supabase is not configured');
}

// ============ COUPONS ============
export async function fetchCoupons(): Promise<Coupon[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as Coupon[];
  }
  initDemo();
  return readLS<Coupon[]>(LS_KEYS.coupons, SEED_COUPONS);
}

export async function upsertCoupon(c: Coupon): Promise<Coupon> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('coupons').upsert(c).select().single();
    if (error) throw error;
    return data as Coupon;
  }
  const list = readLS<Coupon[]>(LS_KEYS.coupons, SEED_COUPONS);
  const idx = list.findIndex((x) => x.id === c.id);
  if (idx >= 0) list[idx] = c;
  else list.unshift(c);
  writeLS(LS_KEYS.coupons, list);
  return c;
}

export async function deleteCoupon(id: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('coupons').delete().eq('id', id);
    if (error) throw error;
    return;
  }
  const list = readLS<Coupon[]>(LS_KEYS.coupons, SEED_COUPONS).filter((x) => x.id !== id);
  writeLS(LS_KEYS.coupons, list);
}

// ============ OFFERS ============
export async function fetchActiveOffer(): Promise<Offer | null> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('offers').select('*').eq('is_active', true).maybeSingle();
    if (error) throw error;
    return (data as Offer) ?? null;
  }
  initDemo();
  const list = readLS<Offer[]>(LS_KEYS.offers, [SEED_OFFER]);
  return list.find((o) => o.is_active) ?? list[0] ?? null;
}

export async function fetchAllOffers(): Promise<Offer[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('offers').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as Offer[];
  }
  initDemo();
  return readLS<Offer[]>(LS_KEYS.offers, [SEED_OFFER]);
}

export async function upsertOffer(o: Offer): Promise<Offer> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('offers').upsert(o).select().single();
    if (error) throw error;
    return data as Offer;
  }
  const list = readLS<Offer[]>(LS_KEYS.offers, [SEED_OFFER]);
  const idx = list.findIndex((x) => x.id === o.id);
  if (idx >= 0) list[idx] = o;
  else list.unshift(o);
  writeLS(LS_KEYS.offers, list);
  return o;
}

// ============ ORDERS ============
export async function fetchOrders(): Promise<Order[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as Order[];
  }
  initDemo();
  return readLS<Order[]>(LS_KEYS.orders, []);
}

export async function fetchMyOrders(): Promise<Order[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as Order[];
  }
  initDemo();
  return readLS<Order[]>(LS_KEYS.orders, []);
}

export async function insertOrder(order: Omit<Order, 'id' | 'created_at' | 'status'>): Promise<Order> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('orders').insert(order).select().single();
    if (error) throw error;
    return data as Order;
  }
  initDemo();
  const list = readLS<Order[]>(LS_KEYS.orders, []);
  const newOrder: Order = {
    ...order,
    id: `ord_${Date.now()}`,
    created_at: new Date().toISOString(),
    status: 'Pending',
  };
  list.unshift(newOrder);
  writeLS(LS_KEYS.orders, list);
  return newOrder;
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    const updates: Record<string, unknown> = { status };
    if (status === 'Cancelled') {
      updates.cancelled_at = new Date().toISOString();
    } else {
      updates.cancelled_at = null;
      updates.cancellation_reason = null;
    }
    const { error } = await supabase.from('orders').update(updates).eq('id', id);
    if (error) throw error;
    return;
  }
  const list = readLS<Order[]>(LS_KEYS.orders, []);
  const idx = list.findIndex((x) => x.id === id);
  if (idx >= 0) {
    list[idx].status = status;
    if (status === 'Cancelled') {
      list[idx].cancelled_at = new Date().toISOString();
    } else {
      list[idx].cancelled_at = null;
      list[idx].cancellation_reason = null;
    }
    writeLS(LS_KEYS.orders, list);
  }
}

// ============ PROFILES ============
export async function fetchMyProfile(): Promise<Profile | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data, error } = await supabase.from('profiles').select('*').maybeSingle();
  if (error) throw error;
  return (data as Profile) ?? null;
}

export async function updateMyProfile(updates: Partial<Pick<Profile, 'full_name' | 'phone' | 'address' | 'pincode'>>): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return;
  const { error } = await supabase.from('profiles').update(updates).eq('id', (await supabase.auth.getUser()).data.user?.id);
  if (error) throw error;
}

export async function checkEmailExists(email: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  const { data, error } = await supabase.rpc('email_exists', { email_to_check: email });
  if (error) throw error;
  return Boolean(data);
}

export async function checkPhoneExists(phone: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  const { data, error } = await supabase.rpc('phone_exists', { phone_to_check: phone });
  if (error) throw error;
  return Boolean(data);
}

export async function get_email_by_phone(phone_input: string): Promise<string | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data, error } = await supabase.rpc('get_email_by_phone', { phone_input });
  if (error) throw error;
  return (data as string | null) ?? null;
}

export async function getEmailByPhone(phone: string): Promise<string | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data, error } = await supabase.rpc('get_email_by_phone', { phone_input: phone });
  if (error) throw error;
  return (data as string | null) ?? null;
}

export async function cancelOrderWithReason(id: string, reason: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('orders')
      .update({ status: 'Cancelled', cancellation_reason: reason, cancelled_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
    return;
  }
  const list = readLS<Order[]>(LS_KEYS.orders, []);
  const idx = list.findIndex((x) => x.id === id);
  if (idx >= 0) {
    list[idx].status = 'Cancelled';
    list[idx].cancellation_reason = reason;
    list[idx].cancelled_at = new Date().toISOString();
    writeLS(LS_KEYS.orders, list);
  }
}

export async function fetchOrdersByUser(userId: string): Promise<Order[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as Order[];
  }
  initDemo();
  return readLS<Order[]>(LS_KEYS.orders, []).filter((o) => o.user_id === userId);
}

// ============ ADMIN: USERS ============
export async function fetchAllUsers(): Promise<AdminUser[]> {
  if (!isSupabaseConfigured || !supabase) {
    // Return demo users for local admin access
    return [];
  }
  const { data, error } = await supabase.rpc('fetch_all_users');
  if (error) throw error;
  return (data ?? []) as AdminUser[];
}

// ============ ADMIN: ALL ORDERS ============
export async function fetchAllOrders(): Promise<Order[]> {
  return fetchOrders();
}

// ============ SUPPLIERS ============
export async function fetchSuppliers(): Promise<Supplier[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('suppliers').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as Supplier[];
  }
  return [];
}

export async function upsertSupplier(s: Supplier): Promise<Supplier> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('suppliers').upsert(s).select().single();
    if (error) throw error;
    return data as Supplier;
  }
  return s;
}

export async function deleteSupplier(id: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('suppliers').delete().eq('id', id);
    if (error) throw error;
    return;
  }
}

// ============ IMAGE UPLOAD ============
export async function uploadProductImage(file: File): Promise<string> {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase not configured');
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}.${fileExt}`;
  const filePath = `products/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('product-images')
    .upload(filePath, file, {
      upsert: true,
      contentType: file.type || undefined,
      cacheControl: '31536000',
    });

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage
    .from('product-images')
    .getPublicUrl(filePath);

  return data.publicUrl;
}
