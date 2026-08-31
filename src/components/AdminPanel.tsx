import { useState, useEffect } from 'react';
import {
  Lock, X, LayoutDashboard, Ticket, Package, Plus, Trash2, Edit2,
  TrendingUp, ShoppingBag, ArrowLeft, Users, Mail, Phone, MapPin,
  Shield, AlertCircle, ChevronRight, Calendar, Ban, Upload, Image as ImageIcon,
  Search, Globe,
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import {
  fetchAllOffers, upsertOffer,
  fetchCoupons, upsertCoupon, deleteCoupon,
  fetchAllOrders, updateOrderStatus,
  fetchProducts, upsertProduct, deleteProduct,
  fetchAllUsers, fetchOrdersByUser, cancelOrderWithReason,
  fetchSuppliers, upsertSupplier,
  uploadProductImage, fetchImportSources, upsertImportSource, deleteImportSource,
} from '@/lib/store';
import type { Offer, Coupon, Order, OrderStatus, Product, AdminUser, Supplier, ImportSource } from '@/lib/types';
import { printInvoice } from '@/lib/invoice';

type Tab = 'offers' | 'coupons' | 'orders' | 'products' | 'indiamart' | 'importSources' | 'users';

const STATUS_OPTIONS: OrderStatus[] = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];
const STATUS_COLORS: Record<string, string> = {
  Pending: 'bg-brand-100 text-brand-700',
  Confirmed: 'bg-blue-100 text-blue-700',
  Shipped: 'bg-purple-100 text-purple-700',
  Delivered: 'bg-accent-100 text-accent-700',
  Cancelled: 'bg-red-100 text-red-700',
};

export function AdminPanel() {
  const { user, profile, loading: authLoading } = useAuth();
  const [tab, setTab] = useState<Tab>('offers');

  // Allow access via PIN gate without requiring Supabase auth
  // If user is logged in via Supabase, check for admin privileges
  if (user && !profile?.is_admin) {
    return <AccessDenied message="You do not have admin access. Only admin users can view this dashboard." />;
  }

  const tabs: { key: Tab; label: string; icon: typeof LayoutDashboard }[] = [
    { key: 'offers', label: 'Offers & Banners', icon: LayoutDashboard },
    { key: 'coupons', label: 'Coupons', icon: Ticket },
    { key: 'orders', label: 'Orders', icon: Package },
    { key: 'products', label: 'Products', icon: ShoppingBag },
    { key: 'indiamart', label: 'IndiaMART Import', icon: Globe },
    { key: 'importSources', label: 'Import Sources', icon: Globe },
    { key: 'users', label: 'Users', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-ink-50">
      {/* Admin header */}
      <div className="bg-ink-900 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <LayoutDashboard className="h-5 w-5 text-brand-300" />
              <h1 className="font-display text-xl font-semibold">Admin Dashboard</h1>
              <span className="hidden sm:inline-flex items-center gap-1 chip bg-white/10 text-brand-200">
                <Shield className="h-3 w-3" /> {profile?.full_name || user?.email || 'Admin'}
              </span>
            </div>
            <button
              onClick={() => window.history.pushState({}, '', '/')}
              className="flex items-center gap-1.5 text-sm text-ink-300 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Exit to Store
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 shrink-0 rounded-full px-4 py-2.5 text-sm font-medium transition-colors ${
                tab === t.key ? 'bg-ink-900 text-white' : 'bg-white border border-ink-200 text-ink-600 hover:border-ink-400'
              }`}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'offers' && <OffersTab />}
        {tab === 'coupons' && <CouponsTab />}
        {tab === 'orders' && <OrdersTab />}
        {tab === 'products' && <ProductsTab />}
        {tab === 'indiamart' && <IndiaMARTTab />}
        {tab === 'importSources' && <ImportSourcesTab />}
        {tab === 'users' && <UsersTab />}
      </div>
    </div>
  );
}

function AccessDenied({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-ink-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 mx-auto mb-4">
          <AlertCircle className="h-8 w-8 text-red-500" />
        </div>
        <h1 className="font-display text-2xl font-semibold text-ink-900 mb-2">Access Denied</h1>
        <p className="text-sm text-ink-500 mb-6">{message}</p>
        <button
          onClick={() => window.history.pushState({}, '', '/')}
          className="btn-primary w-full"
        >
          Back to Store
        </button>
      </div>
    </div>
  );
}

// ============ OFFERS TAB ============
function OffersTab() {
  const { toast } = useToast();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Offer | null>(null);

  const load = () => {
    fetchAllOffers().then(setOffers).catch(() => toast('Failed to load offers', 'error')).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleSave = async (o: Offer) => {
    try {
      await upsertOffer(o);
      toast('Offer saved successfully', 'success');
      setEditing(null);
      load();
    } catch {
      toast('Failed to save offer', 'error');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-2xl font-semibold text-ink-900">Offers & Banners</h2>
        <button
          onClick={() => setEditing({
            id: `off_${Date.now()}`, hero_title: '', hero_subtitle: '', banner_tag: '', promo_text: '', is_active: true,
          })}
          className="btn-primary text-xs px-4 py-2"
        >
          <Plus className="h-4 w-4" /> New Offer
        </button>
      </div>

      <div className="grid gap-4">
        {offers.map((offer) => (
          <div key={offer.id} className="rounded-xl border border-ink-100 bg-white p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`chip ${offer.is_active ? 'bg-accent-100 text-accent-700' : 'bg-ink-100 text-ink-500'}`}>
                    {offer.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <h3 className="font-display text-xl font-semibold text-ink-900">{offer.hero_title}</h3>
                <p className="text-sm text-ink-500 mt-1">{offer.hero_subtitle}</p>
                <div className="mt-2 flex flex-wrap gap-4 text-xs text-ink-600">
                  <span><strong className="text-ink-800">Tag:</strong> {offer.banner_tag}</span>
                  <span><strong className="text-ink-800">Promo:</strong> {offer.promo_text}</span>
                </div>
              </div>
              <button onClick={() => setEditing(offer)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-ink-200 text-ink-600 hover:bg-ink-50">
                <Edit2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <OfferEditor offer={editing} onSave={handleSave} onCancel={() => setEditing(null)} />
      )}
    </div>
  );
}

function OfferEditor({ offer, onSave, onCancel }: { offer: Offer; onSave: (o: Offer) => void; onCancel: () => void }) {
  const [form, setForm] = useState(offer);
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-950/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl animate-scale-in">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-xl font-semibold text-ink-900">Edit Offer</h3>
          <button onClick={onCancel} className="flex h-9 w-9 items-center justify-center rounded-full text-ink-500 hover:bg-ink-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-ink-600">Hero Title</label>
            <input value={form.hero_title} onChange={(e) => setForm({ ...form, hero_title: e.target.value })} className="input-field mt-1" />
          </div>
          <div>
            <label className="text-xs font-medium text-ink-600">Hero Subtitle</label>
            <input value={form.hero_subtitle} onChange={(e) => setForm({ ...form, hero_subtitle: e.target.value })} className="input-field mt-1" />
          </div>
          <div>
            <label className="text-xs font-medium text-ink-600">Banner Tag</label>
            <input value={form.banner_tag} onChange={(e) => setForm({ ...form, banner_tag: e.target.value })} className="input-field mt-1" />
          </div>
          <div>
            <label className="text-xs font-medium text-ink-600">Promo Text (Alert Bar)</label>
            <input value={form.promo_text} onChange={(e) => setForm({ ...form, promo_text: e.target.value })} className="input-field mt-1" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="h-4 w-4 rounded border-ink-300" />
            <span className="text-sm text-ink-700">Active</span>
          </label>
        </div>
        <div className="flex gap-2 mt-5">
          <button onClick={() => onSave(form)} className="btn-primary flex-1">Save Offer</button>
          <button onClick={onCancel} className="btn-outline">Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ============ COUPONS TAB ============
function CouponsTab() {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Coupon | null>(null);

  const load = () => {
    fetchCoupons().then(setCoupons).catch(() => toast('Failed to load coupons', 'error')).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleSave = async (c: Coupon) => {
    try {
      await upsertCoupon(c);
      toast('Coupon saved', 'success');
      setEditing(null);
      load();
    } catch {
      toast('Failed to save coupon', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCoupon(id);
      toast('Coupon deleted', 'success');
      load();
    } catch {
      toast('Failed to delete coupon', 'error');
    }
  };

  const toggleActive = async (c: Coupon) => {
    await handleSave({ ...c, is_active: !c.is_active });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-2xl font-semibold text-ink-900">Coupons</h2>
        <button
          onClick={() => setEditing({
            id: `c_${Date.now()}`, code: '', discount_type: 'flat', discount_value: 0, min_order_value: 0, expiry_date: '2026-12-31', is_active: true,
          })}
          className="btn-primary text-xs px-4 py-2"
        >
          <Plus className="h-4 w-4" /> New Coupon
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-ink-100 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-ink-50 text-ink-600 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3 text-left">Code</th>
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-left">Value</th>
              <th className="px-4 py-3 text-left">Min Order</th>
              <th className="px-4 py-3 text-left">Expiry</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {coupons.map((c) => (
              <tr key={c.id} className="hover:bg-ink-50/50">
                <td className="px-4 py-3 font-mono font-medium text-ink-900">{c.code}</td>
                <td className="px-4 py-3 text-ink-600 capitalize">{c.discount_type}</td>
                <td className="px-4 py-3 text-ink-600">
                  {c.discount_type === 'flat' ? `₹${c.discount_value}` : `${c.discount_value}%`}
                </td>
                <td className="px-4 py-3 text-ink-600">₹{c.min_order_value}</td>
                <td className="px-4 py-3 text-ink-600">{c.expiry_date ?? '—'}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleActive(c)}
                    className={`chip ${c.is_active ? 'bg-accent-100 text-accent-700' : 'bg-ink-100 text-ink-500'}`}
                  >
                    {c.is_active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => setEditing(c)} className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 hover:bg-ink-100">
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(c.id)} className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <CouponEditor coupon={editing} onSave={handleSave} onCancel={() => setEditing(null)} />
      )}
    </div>
  );
}

function CouponEditor({ coupon, onSave, onCancel }: { coupon: Coupon; onSave: (c: Coupon) => void; onCancel: () => void }) {
  const [form, setForm] = useState(coupon);
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-950/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-scale-in">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-xl font-semibold text-ink-900">{coupon.code ? 'Edit Coupon' : 'New Coupon'}</h3>
          <button onClick={onCancel} className="flex h-9 w-9 items-center justify-center rounded-full text-ink-500 hover:bg-ink-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-ink-600">Code</label>
            <input
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              placeholder="e.g. SUMMER25"
              className="input-field mt-1 font-mono uppercase"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-ink-600">Type</label>
              <select
                value={form.discount_type}
                onChange={(e) => setForm({ ...form, discount_type: e.target.value as 'flat' | 'percentage' })}
                className="input-field mt-1"
              >
                <option value="flat">Flat (₹)</option>
                <option value="percentage">Percentage (%)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-ink-600">Value</label>
              <input
                type="number"
                value={form.discount_value}
                onChange={(e) => setForm({ ...form, discount_value: Number(e.target.value) })}
                className="input-field mt-1"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-ink-600">Min Order Value (₹)</label>
            <input
              type="number"
              value={form.min_order_value}
              onChange={(e) => setForm({ ...form, min_order_value: Number(e.target.value) })}
              className="input-field mt-1"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-ink-600">Expiry Date</label>
            <input
              type="date"
              value={form.expiry_date ?? ''}
              onChange={(e) => setForm({ ...form, expiry_date: e.target.value })}
              className="input-field mt-1"
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="h-4 w-4 rounded border-ink-300" />
            <span className="text-sm text-ink-700">Active</span>
          </label>
        </div>
        <div className="flex gap-2 mt-5">
          <button onClick={() => onSave(form)} className="btn-primary flex-1">Save Coupon</button>
          <button onClick={onCancel} className="btn-outline">Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ============ ORDERS TAB ============
function OrdersTab() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<OrderStatus | 'All'>('All');

  const load = () => {
    fetchAllOrders().then(setOrders).catch(() => toast('Failed to load orders', 'error')).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleStatusChange = async (id: string, status: OrderStatus) => {
    try {
      await updateOrderStatus(id, status);
      toast('Order status updated', 'success');
      load();
    } catch {
      toast('Failed to update status', 'error');
    }
  };

  if (loading) return <LoadingSpinner />;

  const filtered = filter === 'All' ? orders : orders.filter((o) => o.status === filter);
  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === 'Pending').length,
    revenue: orders.filter((o) => o.status !== 'Cancelled').reduce((s, o) => s + o.total, 0),
  };

  return (
    <div>
      <h2 className="font-display text-2xl font-semibold text-ink-900 mb-4">Orders</h2>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl border border-ink-100 bg-white p-4">
          <div className="flex items-center gap-2 text-ink-500 text-xs"><ShoppingBag className="h-4 w-4" /> Total Orders</div>
          <div className="font-display text-2xl font-bold text-ink-900 mt-1">{stats.total}</div>
        </div>
        <div className="rounded-xl border border-ink-100 bg-white p-4">
          <div className="flex items-center gap-2 text-ink-500 text-xs"><Package className="h-4 w-4" /> Pending</div>
          <div className="font-display text-2xl font-bold text-brand-600 mt-1">{stats.pending}</div>
        </div>
        <div className="rounded-xl border border-ink-100 bg-white p-4">
          <div className="flex items-center gap-2 text-ink-500 text-xs"><TrendingUp className="h-4 w-4" /> Revenue</div>
          <div className="font-display text-2xl font-bold text-accent-600 mt-1">₹{stats.revenue.toLocaleString('en-IN')}</div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
        {(['All', ...STATUS_OPTIONS] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
              filter === s ? 'bg-ink-900 text-white' : 'bg-white border border-ink-200 text-ink-600'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center rounded-xl border border-dashed border-ink-200">
          <Package className="h-10 w-10 text-ink-300 mb-3" />
          <p className="text-sm text-ink-500">No orders found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => (
            <div key={order.id} className="rounded-xl border border-ink-100 bg-white p-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-medium text-ink-600">
                      #{order.id.slice(0, 12).toUpperCase()}
                    </span>
                    <span className={`chip ${STATUS_COLORS[order.status]}`}>{order.status}</span>
                  </div>
                  <h3 className="font-medium text-ink-900">{order.full_name}</h3>
                  <div className="mt-1 text-xs text-ink-500 space-y-0.5">
                    <div className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> {order.phone}</div>
                    <div className="flex items-start gap-1.5"><MapPin className="h-3 w-3 mt-0.5" /> {order.address} — {order.pincode}</div>
                    <p>{order.items.length} items — {order.items.map((i) => `${i.title} (${i.size}) x${i.quantity}`).join(', ')}</p>
                    {order.coupon_code && <p>Coupon: <span className="font-mono font-medium">{order.coupon_code}</span></p>}
                    <p>{new Date(order.created_at).toLocaleString('en-IN')}</p>
                  </div>
                </div>
                <div className="sm:text-right">
                  <div className="font-bold text-ink-900 text-lg">₹{order.total.toLocaleString('en-IN')}</div>
                  <div className="text-xs text-ink-400">COD</div>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                    className="mt-2 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-xs text-ink-700 focus:border-ink-900 focus:outline-none"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <button type="button" onClick={() => printInvoice(order)} className="mt-2 ml-2 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-700 hover:bg-ink-50">
                    Invoice PDF
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============ PRODUCTS TAB ============
function ProductsTab() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Product | null>(null);
  const [addingSupplier, setAddingSupplier] = useState(false);

  const load = () => {
    Promise.all([
      fetchProducts().then(setProducts).catch(() => toast('Failed to load products', 'error')),
      fetchSuppliers().then(setSuppliers).catch(() => toast('Failed to load suppliers', 'error')),
    ]).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleSave = async (p: Product) => {
    try {
      await upsertProduct(p);
      toast('Product saved', 'success');
      setEditing(null);
      load();
    } catch (error) {
      console.error('Failed to save product:', error);
      toast(error instanceof Error ? `Failed to save product: ${error.message}` : 'Failed to save product', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id);
      toast('Product deleted', 'success');
      load();
    } catch {
      toast('Failed to delete product', 'error');
    }
  };

  const handleAddSupplier = async (supplier: Supplier) => {
    try {
      await upsertSupplier(supplier);
      toast('Supplier added', 'success');
      setAddingSupplier(false);
      load();
    } catch {
      toast('Failed to add supplier', 'error');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-2xl font-semibold text-ink-900">Products</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAddingSupplier(true)}
            className="btn-outline text-xs px-4 py-2"
          >
            <Plus className="h-4 w-4" /> Add Supplier
          </button>
          <button
            onClick={() => setEditing({
              id: crypto.randomUUID(),
              name: '',
              image: '',
              image_urls: [],
              original_price: 0,
              selling_price: 0,
              supplier_id: null,
              supplier_name: '',
              supplier_url: null,
              indiamart_url: null,
              stock: 0,
              category: 'Men',
              description: null,
              created_at: new Date().toISOString(),
              source: 'manual',
              source_product_id: null,
            })}
            className="btn-primary text-xs px-4 py-2"
          >
            <Plus className="h-4 w-4" /> New Product
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((p) => (
          <div key={p.id} className="rounded-xl border border-ink-100 bg-white overflow-hidden hover:shadow-md transition-shadow">
            <div className="relative">
              <img src={p.image} alt={p.name} className="h-40 w-full object-cover" />
              <div className="absolute top-2 left-2 flex gap-1">
                {p.source === 'indiamart' && (
                  <span className="chip bg-brand-500 text-white text-xs">IndiaMART</span>
                )}
              </div>
              <div className="absolute top-2 right-2 chip bg-white/90 text-ink-700 text-xs">
                {p.category}
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-ink-900 line-clamp-1">{p.name}</h3>
                  {p.supplier_name && (
                    <p className="text-xs text-ink-500 mt-1">Supplier: {p.supplier_name}</p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-bold text-ink-900">₹{p.selling_price.toLocaleString('en-IN')}</div>
                  <div className="text-xs text-ink-400 line-through">₹{p.original_price.toLocaleString('en-IN')}</div>
                  {p.source === 'indiamart' && (
                    <div className="text-xs text-green-600 mt-1">
                      Margin: ₹{(p.selling_price - p.original_price).toLocaleString('en-IN')}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-ink-100">
                <div className="text-xs text-ink-500">
                  Stock: <span className={p.stock > 10 ? 'text-green-600' : p.stock > 0 ? 'text-orange-600' : 'text-red-600'}>
                    {p.stock > 0 ? p.stock : 'Out of stock'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setEditing(p)} className="flex items-center justify-center gap-1.5 rounded-lg border border-ink-200 px-3 py-2 text-xs font-medium text-ink-600 hover:bg-ink-50">
                    <Edit2 className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="flex items-center justify-center h-8 w-8 rounded-lg text-red-500 hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <ProductEditor product={editing} suppliers={suppliers} onSave={handleSave} onCancel={() => setEditing(null)} />
      )}

      {addingSupplier && (
        <SupplierEditor onSave={handleAddSupplier} onCancel={() => setAddingSupplier(false)} />
      )}
    </div>
  );
}

function ProductEditor({ product, suppliers, onSave, onCancel }: { product: Product; suppliers: Supplier[]; onSave: (p: Product) => void; onCancel: () => void }) {
  const { toast } = useToast();
  const [form, setForm] = useState(product);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'pricing' | 'supplier' | 'images'>('basic');

  const handleImageUpload = async (file: File) => {
    try {
      setUploading(true);
      const url = await uploadProductImage(file);
      setForm({ ...form, image: url, image_urls: [...form.image_urls, url] });
      toast('Image uploaded successfully', 'success');
    } catch (error) {
      toast('Failed to upload image', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSupplierChange = (supplierId: string | null) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    setForm({
      ...form,
      supplier_id: supplierId,
      supplier_name: supplier?.name || '',
      indiamart_url: supplier?.indiamart_url || null,
    });
  };

  const handleSave = () => {
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-950/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-2xl max-h-[90vh] rounded-2xl bg-white shadow-2xl animate-scale-in flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink-100">
          <h3 className="font-display text-xl font-semibold text-ink-900">{product.name ? 'Edit Product' : 'New Product'}</h3>
          <button onClick={onCancel} className="flex h-9 w-9 items-center justify-center rounded-full text-ink-500 hover:bg-ink-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-6 pt-4 border-b border-ink-100 overflow-x-auto">
          {[
            { key: 'basic', label: 'Basic Info' },
            { key: 'pricing', label: 'Pricing' },
            { key: 'supplier', label: 'Supplier' },
            { key: 'images', label: 'Images' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-ink-900 text-ink-900'
                  : 'border-transparent text-ink-500 hover:text-ink-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'basic' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-ink-600">Product Name *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g., Oversized Knit Sweater"
                  className="input-field mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-ink-600">Description</label>
                <textarea
                  value={form.description ?? ''}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Product description..."
                  rows={4}
                  className="input-field mt-1 resize-none"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-ink-600">Category *</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value as Product['category'] })}
                  className="input-field mt-1"
                >
                  <option value="Men">Men</option>
                  <option value="Women">Women</option>
                  <option value="Trendy">Trendy</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'pricing' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-ink-600">
                    Supplier Price (₹) *
                    {form.source === 'indiamart' && (
                      <span className="ml-2 text-xs text-brand-600">(IndiaMART)</span>
                    )}
                  </label>
                  <input
                    type="number"
                    value={form.original_price}
                    onChange={(e) => setForm({ ...form, original_price: Number(e.target.value) })}
                    className="input-field mt-1"
                  />
                  {form.source === 'indiamart' && (
                    <p className="text-xs text-ink-500 mt-1">Original price from IndiaMART supplier</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-medium text-ink-600">Selling Price (₹) *</label>
                  <input
                    type="number"
                    value={form.selling_price}
                    onChange={(e) => setForm({ ...form, selling_price: Number(e.target.value) })}
                    className="input-field mt-1"
                  />
                </div>
              </div>
              {form.original_price > 0 && form.selling_price > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-700">
                    Profit Margin: {Math.round(((form.selling_price - form.original_price) / form.original_price) * 100)}%
                    {' '} (₹{(form.selling_price - form.original_price).toLocaleString('en-IN')})
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'supplier' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-ink-600">Select Supplier</label>
                <select
                  value={form.supplier_id || ''}
                  onChange={(e) => handleSupplierChange(e.target.value || null)}
                  className="input-field mt-1"
                >
                  <option value="">No Supplier</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-ink-600">Supplier Name</label>
                <input
                  value={form.supplier_name}
                  onChange={(e) => setForm({ ...form, supplier_name: e.target.value })}
                  placeholder="e.g., ABC Textiles"
                  className="input-field mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-ink-600">IndiaMART Supplier URL</label>
                <input
                  value={form.indiamart_url || ''}
                  onChange={(e) => setForm({ ...form, indiamart_url: e.target.value })}
                  placeholder="https://www.indiamart.com/..."
                  className="input-field mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-ink-600">Supplier URL</label>
                <input
                  value={form.supplier_url || ''}
                  onChange={(e) => setForm({ ...form, supplier_url: e.target.value })}
                  placeholder="https://..."
                  className="input-field mt-1"
                />
              </div>
            </div>
          )}

          {activeTab === 'images' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-ink-600">Main Image *</label>
                <div className="flex gap-2 mt-1">
                  <input
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    className="input-field flex-1"
                  />
                  <label className="btn-primary cursor-pointer flex items-center gap-2 px-4">
                    <Upload className="h-4 w-4" />
                    {uploading ? 'Uploading...' : 'Upload'}
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploading}
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file);
                      }}
                    />
                  </label>
                </div>
                {form.image && (
                  <div className="mt-2 rounded-lg overflow-hidden border border-ink-200">
                    <img src={form.image} alt="Preview" className="w-full h-48 object-cover" />
                  </div>
                )}
              </div>
              <div>
                <label className="text-xs font-medium text-ink-600">Additional Images</label>
                <div className="mt-2 space-y-2">
                  {form.image_urls.map((url, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        value={url}
                        onChange={(e) => {
                          const newUrls = [...form.image_urls];
                          newUrls[idx] = e.target.value;
                          setForm({ ...form, image_urls: newUrls });
                        }}
                        className="input-field flex-1"
                      />
                      <button
                        onClick={() => {
                          const newUrls = form.image_urls.filter((_, i) => i !== idx);
                          setForm({ ...form, image_urls: newUrls });
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => setForm({ ...form, image_urls: [...form.image_urls, ''] })}
                    className="btn-outline text-xs px-4 py-2"
                  >
                    <Plus className="h-4 w-4" /> Add Image URL
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-6 py-4 border-t border-ink-100">
          <button onClick={handleSave} className="btn-primary flex-1">Save Product</button>
          <button onClick={onCancel} className="btn-outline">Cancel</button>
        </div>
      </div>
    </div>
  );
}

function SupplierEditor({ onSave, onCancel }: { onSave: (s: Supplier) => void; onCancel: () => void }) {
  const [form, setForm] = useState<Supplier>({
    id: `s_${Date.now()}`,
    name: '',
    phone: '',
    address: '',
    rating: 0,
    indiamart_url: null,
    created_at: new Date().toISOString(),
  });

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-950/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-scale-in">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-xl font-semibold text-ink-900">Add Supplier</h3>
          <button onClick={onCancel} className="flex h-9 w-9 items-center justify-center rounded-full text-ink-500 hover:bg-ink-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-ink-600">Supplier Name *</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g., ABC Textiles"
              className="input-field mt-1"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-ink-600">Phone *</label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="e.g., +91 98765 43210"
              className="input-field mt-1"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-ink-600">Address *</label>
            <textarea
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Supplier address..."
              rows={3}
              className="input-field mt-1 resize-none"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-ink-600">IndiaMART URL</label>
            <input
              value={form.indiamart_url || ''}
              onChange={(e) => setForm({ ...form, indiamart_url: e.target.value })}
              placeholder="https://www.indiamart.com/..."
              className="input-field mt-1"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-ink-600">Rating (0-5)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="5"
              value={form.rating}
              onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
              className="input-field mt-1"
            />
          </div>
        </div>
        <div className="flex gap-2 mt-5">
          <button onClick={() => onSave(form)} className="btn-primary flex-1">Save Supplier</button>
          <button onClick={onCancel} className="btn-outline">Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ============ INDIAMART IMPORT TAB ============
interface IndiaMARTSearchResult {
  id: string;
  name: string;
  image: string;
  supplier_name: string;
  supplier_price: number;
  category?: string;
  description?: string;
  supplier_url?: string;
  indiamart_url?: string;
}

function IndiaMARTTab() {
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<IndiaMARTSearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState<string | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    fetchSuppliers().then(setSuppliers).catch(() => {});
  }, []);

  // Debounced search for suggestions
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length > 2) {
        try {
          const response = await fetch('/api/indiamart/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: query.trim() }),
          });
          const text = await response.text();
          let data: any = null;
          try { data = text ? JSON.parse(text) : null; } catch { data = null; }
          if (response.ok && data?.results) {
            const titles = data.results.slice(0, 5).map((r: any) => r.title);
            setSuggestions(titles);
            setShowSuggestions(true);
          }
        } catch {
          // Ignore errors for suggestions
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSearch = async () => {
    if (!query.trim()) {
      setError('Please enter a search query');
      return;
    }

    setSearching(true);
    setError(null);
    setResults([]);

    try {
      const response = await fetch('/api/indiamart/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim() }),
      });

      const text = await response.text();
      let data: any = null;
      try { data = text ? JSON.parse(text) : null; } catch { data = null; }

      if (!response.ok) {
        throw new Error(data?.error || `Search failed (HTTP ${response.status})`);
      }
      if (!data) {
        throw new Error('Search service returned an empty response');
      }

      setResults(data.results || []);

      if (data.results?.length === 0) {
        setError('No products found');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search IndiaMART');
    } finally {
      setSearching(false);
    }
  };

  const handleImport = async (result: IndiaMARTSearchResult) => {
    setImporting(result.id);

    try {
      // Check for duplicate by source_product_id
      const existingProducts = await fetchProducts();
      const duplicate = existingProducts.find(p => p.source_product_id === result.id);

      if (duplicate) {
        toast('Product already exists', 'error');
        setImporting(null);
        return;
      }

      // Find or create supplier
      let supplierId = null;
      const existingSupplier = suppliers.find(s => 
        s.name.toLowerCase() === result.supplier_name.toLowerCase()
      );

      if (existingSupplier) {
        supplierId = existingSupplier.id;
      } else {
        // Create new supplier
        const newSupplier: Supplier = {
          id: `s_${Date.now()}`,
          name: result.supplier_name,
          phone: '',
          address: '',
          rating: 0,
          indiamart_url: result.indiamart_url || null,
          created_at: new Date().toISOString(),
        };
        await upsertSupplier(newSupplier);
        supplierId = newSupplier.id;
        const updatedSuppliers = await fetchSuppliers();
        setSuppliers(updatedSuppliers);
      }

      // Determine category
      let category: 'Men' | 'Women' | 'Trendy' = 'Trendy';
      const queryLower = query.toLowerCase();
      if (queryLower.includes('men') || queryLower.includes('male') || queryLower.includes('boy')) {
        category = 'Men';
      } else if (queryLower.includes('women') || queryLower.includes('female') || queryLower.includes('girl') || queryLower.includes('ladies')) {
        category = 'Women';
      }

      // Create product
      const newProduct: Product = {
        id: crypto.randomUUID(),
        name: result.name,
        image: result.image,
        image_urls: [result.image],
        original_price: result.supplier_price,
        selling_price: Math.round(result.supplier_price * 1.5), // Default 50% markup
        supplier_id: supplierId,
        supplier_name: result.supplier_name,
        supplier_url: result.supplier_url || null,
        indiamart_url: result.indiamart_url || null,
        stock: 50, // Default stock
        category: category,
        description: result.description || null,
        created_at: new Date().toISOString(),
        source: 'indiamart',
        source_product_id: result.id,
      };

      await upsertProduct(newProduct);
      toast('Product imported successfully', 'success');
      
      // Remove from results
      setResults(results.filter(r => r.id !== result.id));
    } catch (err) {
      toast('Failed to import product', 'error');
    } finally {
      setImporting(null);
    }
  };

  return (
    <div>
      <h2 className="font-display text-2xl font-semibold text-ink-900 mb-4">IndiaMART Import</h2>
      
      {/* Search Section */}
      <div className="bg-white rounded-xl border border-ink-200 p-6 mb-6 relative">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Search products (e.g., women kurti, men t-shirt)"
              className="input-field w-full"
              disabled={searching}
            />
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-ink-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setQuery(suggestion);
                      setShowSuggestions(false);
                      handleSearch();
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-ink-50 text-sm text-ink-700 border-b border-ink-100 last:border-0"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={handleSearch}
            disabled={searching || !query.trim()}
            className="btn-primary flex items-center gap-2 px-6"
          >
            <Search className="h-4 w-4" />
            {searching ? 'Searching...' : 'Search'}
          </button>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
            {error}
          </div>
        )}
      </div>

      {/* Results Section */}
      {results.length > 0 && (
        <div>
          <h3 className="font-medium text-ink-900 mb-3">
            Results ({results.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((result) => (
              <div key={result.id} className="rounded-xl border border-ink-200 bg-white overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative">
                  {result.image ? (
                    <img 
                      src={result.image} 
                      alt={result.name} 
                      className="h-40 w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/300x200?text=No+Image';
                      }}
                    />
                  ) : (
                    <div className="h-40 w-full bg-gradient-to-br from-ink-100 to-ink-200 flex items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-ink-400" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-brand-500 text-white text-xs px-2 py-1 rounded-full">
                    IndiaMART
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="font-medium text-ink-900 line-clamp-2 mb-3 min-h-[2.5rem]">{result.name}</h4>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <span className="font-medium text-ink-700 shrink-0">Supplier:</span>
                      <span className="text-ink-600">{result.supplier_name || 'Unknown'}</span>
                    </div>
                    
                    {result.supplier_price > 0 ? (
                      <div className="flex items-start gap-2">
                        <span className="font-medium text-ink-700 shrink-0">Price:</span>
                        <span className="text-ink-600 font-semibold">₹{result.supplier_price.toLocaleString('en-IN')}</span>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2">
                        <span className="font-medium text-ink-700 shrink-0">Price:</span>
                        <span className="text-ink-400 italic">Contact for price</span>
                      </div>
                    )}
                    
                    {result.category && (
                      <div className="flex items-start gap-2">
                        <span className="font-medium text-ink-700 shrink-0">Category:</span>
                        <span className="text-ink-600">{result.category}</span>
                      </div>
                    )}
                    
                    {result.description && (
                      <div className="flex items-start gap-2">
                        <span className="font-medium text-ink-700 shrink-0">Details:</span>
                        <span className="text-ink-500 line-clamp-2">{result.description}</span>
                      </div>
                    )}
                    
                    {result.indiamart_url && (
                      <a 
                        href={result.indiamart_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-brand-600 hover:text-brand-700 text-sm"
                      >
                        <Globe className="h-3 w-3" /> View on IndiaMART
                      </a>
                    )}
                  </div>
                  
                  <button
                    onClick={() => handleImport(result)}
                    disabled={importing === result.id}
                    className="btn-primary w-full mt-4 text-sm"
                  >
                    {importing === result.id ? 'Importing...' : 'Import Product'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {results.length === 0 && !searching && !error && (
        <div className="text-center py-12 text-ink-500">
          <Globe className="h-12 w-12 mx-auto mb-3 text-ink-300" />
          <p>Search for products on IndiaMART to import them into your store</p>
        </div>
      )}
    </div>
  );
}

// ============ IMPORT SOURCES TAB ============
function ImportSourcesTab() {
  const { toast } = useToast();
  const [sources, setSources] = useState<ImportSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<ImportSource | null>(null);

  const emptySource = (): ImportSource => ({
    id: crypto.randomUUID(),
    name: '', website_url: '', logo: null, method: 'scraper',
    api_endpoint: null, api_key: null, selectors: {}, enabled: true,
    created_at: new Date().toISOString(),
  });

  const load = async () => {
    try { setSources(await fetchImportSources()); }
    catch { toast('Failed to load import sources', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing?.name.trim() || !editing.website_url.trim()) {
      toast('Website name and URL are required', 'error'); return;
    }
    setSaving(true);
    try {
      const saved = await upsertImportSource(editing);
      setSources(prev => [saved, ...prev.filter(s => s.id !== saved.id)]);
      setEditing(null);
      toast('Import source saved successfully', 'success');
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Failed to save import source', 'error');
    } finally { setSaving(false); }
  };

  const remove = async (id: string) => {
    if (!window.confirm('Delete this import source?')) return;
    try {
      await deleteImportSource(id);
      setSources(prev => prev.filter(s => s.id !== id));
      toast('Import source deleted', 'success');
    } catch { toast('Failed to delete import source', 'error'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display text-2xl font-semibold text-ink-900">Import Sources</h2>
          <p className="text-sm text-ink-500 mt-1">Add websites for product import. Existing manual products are unchanged.</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => setEditing(emptySource())}>
          <Plus className="h-4 w-4" /> Add Website
        </button>
      </div>

      {editing && (
        <div className="bg-white rounded-xl border border-ink-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="text-sm font-medium text-ink-700">Website Name
              <input className="input-field w-full mt-1" value={editing.name} onChange={e => setEditing({...editing, name:e.target.value})} placeholder="MyShop" />
            </label>
            <label className="text-sm font-medium text-ink-700">Website URL
              <input className="input-field w-full mt-1" value={editing.website_url} onChange={e => setEditing({...editing, website_url:e.target.value})} placeholder="https://example.com" />
            </label>
            <label className="text-sm font-medium text-ink-700">Logo URL (optional)
              <input className="input-field w-full mt-1" value={editing.logo || ''} onChange={e => setEditing({...editing, logo:e.target.value || null})} placeholder="https://.../logo.png" />
            </label>
            <label className="text-sm font-medium text-ink-700">Method
              <select className="input-field w-full mt-1" value={editing.method} onChange={e => setEditing({...editing, method:e.target.value as ImportSource['method']})}>
                <option value="scraper">Scraper</option><option value="api">API</option><option value="feed">Product Feed</option>
              </select>
            </label>
            <label className="text-sm font-medium text-ink-700">API Endpoint (optional)
              <input className="input-field w-full mt-1" value={editing.api_endpoint || ''} onChange={e => setEditing({...editing, api_endpoint:e.target.value || null})} placeholder="https://..." />
            </label>
            <label className="text-sm font-medium text-ink-700">API Key (optional)
              <input type="password" className="input-field w-full mt-1" value={editing.api_key || ''} onChange={e => setEditing({...editing, api_key:e.target.value || null})} placeholder="Keep secrets server-side when possible" />
            </label>
          </div>
          <details className="mt-4">
            <summary className="cursor-pointer text-sm font-medium text-ink-700">Advanced selectors</summary>
            <p className="text-xs text-ink-500 mt-2 mb-2">Optional JSON mapping for permitted HTML scraping. Auto-detection can be added later.</p>
            <textarea className="input-field w-full min-h-28 font-mono text-xs" value={JSON.stringify(editing.selectors, null, 2)} onChange={e => { try { setEditing({...editing, selectors: JSON.parse(e.target.value || '{}')}); } catch {} }} />
          </details>
          <div className="flex justify-end gap-2 mt-5">
            <button className="btn-secondary" onClick={() => setEditing(null)}>Cancel</button>
            <button className="btn-primary" disabled={saving} onClick={save}>{saving ? 'Saving...' : 'Create Website'}</button>
          </div>
        </div>
      )}

      {loading ? <div className="py-10 text-center text-ink-500">Loading...</div> : sources.length === 0 ? (
        <div className="bg-white rounded-xl border border-ink-200 p-10 text-center text-ink-500">No import sources yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sources.map(source => (
            <div key={source.id} className="bg-white rounded-xl border border-ink-200 p-5">
              <div className="flex items-center gap-3 mb-4">
                {source.logo ? <img src={source.logo} alt="" className="h-10 w-10 rounded-lg object-contain border border-ink-100" /> : <div className="h-10 w-10 rounded-lg bg-ink-100 flex items-center justify-center"><Globe className="h-5 w-5 text-ink-500" /></div>}
                <div className="min-w-0"><h3 className="font-medium text-ink-900 truncate">{source.name}</h3><p className="text-xs text-ink-500 truncate">{source.website_url}</p></div>
              </div>
              <div className="flex items-center justify-between text-sm mb-4"><span className="chip bg-ink-100 text-ink-700">{source.method.toUpperCase()}</span><span className={source.enabled ? 'text-accent-600' : 'text-red-500'}>{source.enabled ? 'Enabled' : 'Disabled'}</span></div>
              <div className="flex gap-2"><button className="btn-secondary flex-1" onClick={() => setEditing(source)}><Edit2 className="h-4 w-4" /> Edit</button><button className="btn-secondary" onClick={() => remove(source.id)}><Trash2 className="h-4 w-4" /></button></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============ USERS TAB ============
function UsersTab() {
  const { toast } = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  const loadUsers = () => {
    fetchAllUsers()
      .then(setUsers)
      .catch(() => toast('Failed to load users', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(loadUsers, []);

  if (loading) return <LoadingSpinner />;

  if (selectedUser) {
    return (
      <UserDetail
        user={selectedUser}
        onBack={() => {
          setSelectedUser(null);
          loadUsers();
        }}
      />
    );
  }

  const stats = {
    total: users.length,
    admins: users.filter((u) => u.is_admin).length,
    revenue: users.reduce((s, u) => s + u.total_spent, 0),
  };

  return (
    <div>
      <h2 className="font-display text-2xl font-semibold text-ink-900 mb-4">Users</h2>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl border border-ink-100 bg-white p-4">
          <div className="flex items-center gap-2 text-ink-500 text-xs"><Users className="h-4 w-4" /> Total Users</div>
          <div className="font-display text-2xl font-bold text-ink-900 mt-1">{stats.total}</div>
        </div>
        <div className="rounded-xl border border-ink-100 bg-white p-4">
          <div className="flex items-center gap-2 text-ink-500 text-xs"><Shield className="h-4 w-4" /> Admins</div>
          <div className="font-display text-2xl font-bold text-brand-600 mt-1">{stats.admins}</div>
        </div>
        <div className="rounded-xl border border-ink-100 bg-white p-4">
          <div className="flex items-center gap-2 text-ink-500 text-xs"><TrendingUp className="h-4 w-4" /> Total Spent</div>
          <div className="font-display text-2xl font-bold text-accent-600 mt-1">₹{stats.revenue.toLocaleString('en-IN')}</div>
        </div>
      </div>

      {/* User cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((u) => (
          <button
            key={u.id}
            onClick={() => setSelectedUser(u)}
            className="text-left rounded-xl border border-ink-100 bg-white p-4 hover:border-ink-300 hover:shadow-sm transition-all"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-ink-900 text-sm font-bold text-white shrink-0">
                {(u.full_name || u.email).charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-medium text-ink-900 truncate">
                    {u.full_name || 'Unnamed User'}
                  </h3>
                  {u.is_admin && (
                    <span className="inline-flex items-center gap-0.5 chip bg-brand-50 text-brand-700 shrink-0">
                      <Shield className="h-3 w-3" /> Admin
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs text-ink-500 mt-0.5">
                  <Mail className="h-3 w-3 shrink-0" />
                  <span className="truncate">{u.email}</span>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-ink-300 shrink-0" />
            </div>
            <div className="mt-3 space-y-1 text-xs text-ink-500">
              {u.phone && <div className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> {u.phone}</div>}
              {u.address && <div className="flex items-start gap-1.5"><MapPin className="h-3 w-3 mt-0.5" /> {u.address}{u.pincode ? `, ${u.pincode}` : ''}</div>}
            </div>
            <div className="mt-3 flex items-center justify-between pt-3 border-t border-ink-100">
              <div>
                <div className="text-xs text-ink-500">Orders</div>
                <div className="text-sm font-bold text-ink-900">{u.order_count}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-ink-500">Total Spent</div>
                <div className="text-sm font-bold text-accent-600">₹{Number(u.total_spent).toLocaleString('en-IN')}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-ink-500">Joined</div>
                <div className="text-xs font-medium text-ink-700">
                  {new Date(u.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ============ USER DETAIL ============
function UserDetail({ user, onBack }: { user: AdminUser; onBack: () => void }) {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelTarget, setCancelTarget] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrdersByUser(user.id)
      .then(setOrders)
      .catch(() => toast('Failed to load user orders', 'error'))
      .finally(() => setLoading(false));
  }, [user.id, toast]);

  const handleStatusChange = async (id: string, status: OrderStatus) => {
    if (status === 'Cancelled') {
      const order = orders.find((o) => o.id === id);
      if (order) setCancelTarget(order);
      return;
    }
    try {
      await updateOrderStatus(id, status);
      toast('Order status updated', 'success');
      const refreshed = await fetchOrdersByUser(user.id);
      setOrders(refreshed);
    } catch {
      toast('Failed to update status', 'error');
    }
  };

  const handleCancelConfirm = async (reason: string) => {
    if (!cancelTarget) return;
    try {
      await cancelOrderWithReason(cancelTarget.id, reason);
      toast('Order cancelled', 'success');
      setCancelTarget(null);
      const refreshed = await fetchOrdersByUser(user.id);
      setOrders(refreshed);
    } catch {
      toast('Failed to cancel order', 'error');
    }
  };

  const cancelledOrders = orders.filter((o) => o.status === 'Cancelled');
  const activeOrders = orders.filter((o) => o.status !== 'Cancelled');

  return (
    <div>
      {/* Back button */}
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900 mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to Users
      </button>

      {/* User info card */}
      <div className="rounded-xl border border-ink-100 bg-white p-5 mb-6">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-ink-900 text-lg font-bold text-white shrink-0">
            {(user.full_name || user.email).charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-display text-xl font-semibold text-ink-900">
                {user.full_name || 'Unnamed User'}
              </h2>
              {user.is_admin && (
                <span className="inline-flex items-center gap-0.5 chip bg-brand-50 text-brand-700">
                  <Shield className="h-3 w-3" /> Admin
                </span>
              )}
            </div>
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-ink-600">
              <div className="flex items-center gap-1.5"><Mail className="h-4 w-4 text-ink-400" /> {user.email}</div>
              {user.phone && <div className="flex items-center gap-1.5"><Phone className="h-4 w-4 text-ink-400" /> {user.phone}</div>}
              {user.address && (
                <div className="flex items-start gap-1.5 sm:col-span-2"><MapPin className="h-4 w-4 text-ink-400 mt-0.5" /> {user.address}{user.pincode ? `, ${user.pincode}` : ''}</div>
              )}
              <div className="flex items-center gap-1.5"><Calendar className="h-4 w-4 text-ink-400" /> Joined {new Date(user.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
            </div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-ink-100">
          <div>
            <div className="text-xs text-ink-500">Total Orders</div>
            <div className="text-lg font-bold text-ink-900">{orders.length}</div>
          </div>
          <div>
            <div className="text-xs text-ink-500">Total Spent</div>
            <div className="text-lg font-bold text-accent-600">₹{Number(user.total_spent).toLocaleString('en-IN')}</div>
          </div>
          <div>
            <div className="text-xs text-ink-500">Cancelled</div>
            <div className="text-lg font-bold text-red-500">{cancelledOrders.length}</div>
          </div>
        </div>
      </div>

      {/* Orders section */}
      <h3 className="font-display text-lg font-semibold text-ink-900 mb-3">Order History</h3>

      {loading ? (
        <LoadingSpinner />
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center rounded-xl border border-dashed border-ink-200">
          <Package className="h-10 w-10 text-ink-300 mb-3" />
          <p className="text-sm text-ink-500">No orders found for this user</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activeOrders.map((order) => (
            <UserOrderCard key={order.id} order={order} onStatusChange={handleStatusChange} />
          ))}

          {cancelledOrders.length > 0 && (
            <div className="mt-6">
              <h4 className="font-medium text-sm text-ink-700 mb-3 flex items-center gap-1.5">
                <Ban className="h-4 w-4 text-red-500" /> Cancelled Orders ({cancelledOrders.length})
              </h4>
              <div className="space-y-3">
                {cancelledOrders.map((order) => (
                  <UserOrderCard key={order.id} order={order} onStatusChange={handleStatusChange} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {cancelTarget && (
        <CancelOrderDialog
          order={cancelTarget}
          onConfirm={handleCancelConfirm}
          onCancel={() => setCancelTarget(null)}
        />
      )}
    </div>
  );
}

function UserOrderCard({ order, onStatusChange }: { order: Order; onStatusChange: (id: string, status: OrderStatus) => void }) {
  return (
    <div className="rounded-xl border border-ink-100 bg-white p-4">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs font-medium text-ink-600">
              #{order.id.slice(0, 12).toUpperCase()}
            </span>
            <span className={`chip ${STATUS_COLORS[order.status]}`}>{order.status}</span>
          </div>
          <div className="mt-1 text-xs text-ink-500 space-y-0.5">
            <div className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> {order.phone}</div>
            <div className="flex items-start gap-1.5"><MapPin className="h-3 w-3 mt-0.5" /> {order.address} — {order.pincode}</div>
            <p>{order.items.length} items — {order.items.map((i) => `${i.title} (${i.size}) x${i.quantity}`).join(', ')}</p>
            {order.coupon_code && <p>Coupon: <span className="font-mono font-medium">{order.coupon_code}</span></p>}
            <p>{new Date(order.created_at).toLocaleString('en-IN')}</p>
            {order.status === 'Cancelled' && order.cancellation_reason && (
              <p className="text-red-600"><strong>Cancellation reason:</strong> {order.cancellation_reason}</p>
            )}
            {order.status === 'Cancelled' && order.cancelled_at && (
              <p className="text-red-500">Cancelled on {new Date(order.cancelled_at).toLocaleString('en-IN')}</p>
            )}
          </div>
        </div>
        <div className="sm:text-right">
          <div className="font-bold text-ink-900 text-lg">₹{order.total.toLocaleString('en-IN')}</div>
          <div className="text-xs text-ink-400">COD</div>
          <select
            value={order.status}
            onChange={(e) => onStatusChange(order.id, e.target.value as OrderStatus)}
            className="mt-2 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-xs text-ink-700 focus:border-ink-900 focus:outline-none"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

function CancelOrderDialog({ order, onConfirm, onCancel }: { order: Order; onConfirm: (reason: string) => void; onCancel: () => void }) {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (!reason.trim()) return;
    setSubmitting(true);
    await onConfirm(reason.trim());
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-950/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-scale-in">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-semibold text-ink-900">Cancel Order</h3>
          <button onClick={onCancel} className="flex h-9 w-9 items-center justify-center rounded-full text-ink-500 hover:bg-ink-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="text-sm text-ink-500 mb-4">
          Order #{order.id.slice(0, 12).toUpperCase()} — ₹{order.total.toLocaleString('en-IN')}
        </p>
        <div>
          <label className="text-xs font-medium text-ink-600">Cancellation Reason</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter reason for cancellation..."
            rows={3}
            className="input-field mt-1 resize-none"
          />
        </div>
        <div className="flex gap-2 mt-5">
          <button onClick={handleConfirm} disabled={submitting || !reason.trim()} className="btn-primary flex-1">
            {submitting ? 'Cancelling...' : 'Confirm Cancel'}
          </button>
          <button onClick={onCancel} className="btn-outline">Close</button>
        </div>
      </div>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink-200 border-t-ink-900" />
    </div>
  );
}
