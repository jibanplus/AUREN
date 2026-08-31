import { useState, useEffect } from 'react';
import { X, User, Package, Phone, MapPin, ShoppingBag, Mail, Save } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { fetchMyOrders, updateMyProfile } from '@/lib/store';
import type { Order } from '@/lib/types';
import { printInvoice } from '@/lib/invoice';

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  Pending: 'bg-brand-100 text-brand-700',
  Confirmed: 'bg-blue-100 text-blue-700',
  Shipped: 'bg-purple-100 text-purple-700',
  Delivered: 'bg-accent-100 text-accent-700',
  Cancelled: 'bg-red-100 text-red-700',
};

export function ProfileModal({ open, onClose }: ProfileModalProps) {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ full_name: '', phone: '', address: '', pincode: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && user) {
      fetchMyOrders().then(setOrders).catch(() => {});
      setDraft({
        full_name: profile?.full_name ?? '',
        phone: profile?.phone ?? '',
        address: profile?.address ?? '',
        pincode: profile?.pincode ?? '',
      });
    }
  }, [open, user, profile]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateMyProfile(draft);
      await refreshProfile();
      toast('Profile updated successfully', 'success');
      setEditing(false);
    } catch {
      toast('Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-950/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-white shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between border-b border-ink-100 bg-white px-6 py-4 z-10">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-ink-700" />
            <h2 className="font-display text-xl font-semibold text-ink-900">My Profile</h2>
          </div>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full text-ink-500 hover:bg-ink-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* User details */}
          <div className="rounded-xl border border-ink-100 bg-ink-50 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ink-900 text-lg font-bold text-white">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-ink-900">{displayName}</p>
                <div className="flex items-center gap-1 text-xs text-ink-500">
                  <Mail className="h-3 w-3" />
                  <span>{user?.email}</span>
                </div>
              </div>
            </div>

            {editing ? (
              <div className="space-y-3 mt-4">
                <div>
                  <label className="text-xs font-medium text-ink-600">Full Name</label>
                  <input
                    type="text"
                    value={draft.full_name}
                    onChange={(e) => setDraft({ ...draft, full_name: e.target.value })}
                    placeholder="Full Name"
                    className="input-field mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-ink-600">Phone</label>
                  <input
                    type="text"
                    value={draft.phone}
                    onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
                    placeholder="Phone Number"
                    className="input-field mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-ink-600">Address</label>
                  <textarea
                    value={draft.address}
                    onChange={(e) => setDraft({ ...draft, address: e.target.value })}
                    placeholder="Shipping Address"
                    rows={2}
                    className="input-field mt-1 resize-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-ink-600">Pincode</label>
                  <input
                    type="text"
                    value={draft.pincode}
                    onChange={(e) => setDraft({ ...draft, pincode: e.target.value })}
                    placeholder="6-digit Pincode"
                    maxLength={6}
                    className="input-field mt-1"
                  />
                </div>
                <div className="flex gap-2">
                  <button onClick={handleSave} disabled={saving} className="btn-primary text-xs px-4 py-2">
                    {saving ? 'Saving...' : <><Save className="h-3.5 w-3.5" /> Save</>}
                  </button>
                  <button onClick={() => setEditing(false)} className="btn-outline text-xs px-4 py-2">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="space-y-2 mt-3">
                {profile?.phone && (
                  <div className="flex items-center gap-2 text-sm text-ink-600">
                    <Phone className="h-4 w-4 text-ink-400" />
                    <span>{profile.phone}</span>
                  </div>
                )}
                {profile?.address && (
                  <div className="flex items-start gap-2 text-sm text-ink-600">
                    <MapPin className="h-4 w-4 text-ink-400 mt-0.5" />
                    <span>{profile.address}{profile.pincode ? `, ${profile.pincode}` : ''}</span>
                  </div>
                )}
                <button onClick={() => setEditing(true)} className="text-xs font-medium text-brand-600 hover:text-brand-700 mt-2">
                  Edit details
                </button>
              </div>
            )}
          </div>

          {/* Order history */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Package className="h-5 w-5 text-ink-700" />
              <h3 className="font-medium text-ink-900">Order History</h3>
            </div>
            {orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center rounded-xl border border-dashed border-ink-200">
                <ShoppingBag className="h-10 w-10 text-ink-200 mb-3" />
                <p className="text-sm text-ink-500">No orders yet</p>
                <p className="text-xs text-ink-400 mt-1">Your placed orders will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <div key={order.id} className="rounded-xl border border-ink-100 bg-white p-4">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-mono text-xs font-medium text-ink-600">
                        #{order.id.slice(0, 12).toUpperCase()}
                      </span>
                      <span className={`chip ${STATUS_COLORS[order.status] ?? 'bg-ink-100 text-ink-700'}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-ink-600">
                      <span>{order.items.length} items</span>
                      <span className="text-ink-300">|</span>
                      <span className="font-bold text-ink-900">₹{order.total.toLocaleString('en-IN')}</span>
                      <span className="text-ink-300">|</span>
                      <span className="text-xs">COD</span>
                    </div>
                    <p className="text-xs text-ink-400 mt-1">
                      {new Date(order.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                    <button type="button" onClick={() => printInvoice(order)} className="mt-3 rounded-lg border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-700 hover:bg-ink-50">
                      Print / Save Invoice PDF
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
