export type Category = 'Men' | 'Women' | 'Trendy';

export interface Product {
  id: string;
  name: string;
  image: string;
  image_urls: string[];
  original_price: number;
  selling_price: number;
  supplier_id: string | null;
  supplier_name: string;
  supplier_url: string | null;
  indiamart_url: string | null;
  stock: number;
  category: Category;
  description: string | null;
  created_at: string;
  source: 'manual' | 'indiamart';
  source_product_id: string | null;
}

export type DiscountType = 'flat' | 'percentage';

export interface Coupon {
  id: string;
  code: string;
  discount_type: DiscountType;
  discount_value: number;
  min_order_value: number;
  expiry_date: string | null;
  is_active: boolean;
}

export interface Offer {
  id: string;
  hero_title: string;
  hero_subtitle: string;
  banner_tag: string;
  promo_text: string;
  is_active: boolean;
}

export type OrderStatus = 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  address: string;
  rating: number;
  indiamart_url: string | null;
  created_at: string;
}


export type ImportMethod = 'api' | 'scraper' | 'feed';

export interface ImportSource {
  id: string;
  name: string;
  website_url: string;
  logo: string | null;
  method: ImportMethod;
  api_endpoint: string | null;
  api_key: string | null;
  selectors: Record<string, string>;
  enabled: boolean;
  created_at: string;
}

export interface OrderItem {
  product_id: string;
  title: string;
  image_url: string;
  size: string | null;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  user_id: string | null;
  full_name: string;
  phone: string;
  address: string;
  pincode: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  coupon_code: string | null;
  status: OrderStatus;
  created_at: string;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  product_id?: string | null;
  quantity?: number;
  amount?: number;
  supplier_id?: string | null;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  address: string;
  pincode: string;
  is_admin: boolean;
  created_at: string;
}

export interface AdminUser extends Profile {
  order_count: number;
  total_spent: number;
}
