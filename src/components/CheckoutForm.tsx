import { useState, useEffect } from 'react';
import { ArrowLeft, Banknote, Lock, CheckCircle2, User } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { insertOrder } from '@/lib/store';
import type { Coupon, Order } from '@/lib/types';
import { printInvoice } from '@/lib/invoice';

interface CheckoutFormProps {
  subtotal: number;
  discount: number;
  total: number;
  appliedCoupon: Coupon | null;
  onBack: () => void;
  onRequireAuth: () => void;
  onOrderPlaced: () => void;
}

export function CheckoutForm({ subtotal, discount, total, appliedCoupon, onBack, onRequireAuth, onOrderPlaced }: CheckoutFormProps) {
  const { items, clearCart } = useCart();
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [form, setForm] = useState({ full_name: '', phone: '', address: '', pincode: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState<Order | null>(null);

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        address: profile.address || '',
        pincode: profile.pincode || '',
      });
    }
  }, [profile]);

  if (!user) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-ink-100 mb-4">
          <User className="h-8 w-8 text-ink-400" />
        </div>
        <h3 className="font-display text-xl font-semibold text-ink-900 mb-2">Sign in to Checkout</h3>
        <p className="text-sm text-ink-500 max-w-xs mb-6">
          Please sign in or create an account to place your order.
        </p>
        <div className="flex gap-2 w-full max-w-xs">
          <button onClick={onRequireAuth} className="btn-primary flex-1">Sign In / Sign Up</button>
          <button onClick={onBack} className="btn-outline">Back</button>
        </div>
      </div>
    );
  }

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.full_name.trim()) e.full_name = 'Required';
    if (!form.phone.trim()) e.phone = 'Required';
    else if (!/^\d{10}$/.test(form.phone.trim())) e.phone = 'Enter a valid 10-digit number';
    if (!form.address.trim()) e.address = 'Required';
    if (!form.pincode.trim()) e.pincode = 'Required';
    else if (!/^\d{6}$/.test(form.pincode.trim())) e.pincode = 'Enter a valid 6-digit pincode';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const orderItems = items.map((i) => ({
        product_id: i.product_id,
        title: i.title,
        image_url: i.image_url,
        size: i.size,
        quantity: i.quantity,
        price: i.price,
      }));
      const order = await insertOrder({
        user_id: user.id,
        full_name: form.full_name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        pincode: form.pincode.trim(),
        items: orderItems,
        subtotal,
        discount,
        total,
        coupon_code: appliedCoupon?.code ?? null,
      });
      setConfirmed(order);
      clearCart();
      toast('Order placed successfully!', 'success');
    } catch {
      toast('Failed to place order. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (confirmed) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 text-center animate-fade-in">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent-50 mb-5">
          <CheckCircle2 className="h-12 w-12 text-accent-500" />
        </div>
        <h3 className="font-display text-2xl font-semibold text-ink-900">Order Confirmed!</h3>
        <p className="mt-2 text-sm text-ink-500 max-w-xs">
          Thank you, {confirmed.full_name.split(' ')[0]}! Your order has been placed successfully.
          Pay ₹{confirmed.total.toLocaleString('en-IN')} via Cash on Delivery.
        </p>
        <div className="mt-6 w-full max-w-xs rounded-xl border border-ink-100 bg-white p-4 text-left">
          <div className="flex justify-between text-sm">
            <span className="text-ink-500">Order ID</span>
            <span className="font-mono font-medium text-ink-800">
              {confirmed.id.slice(0, 12).toUpperCase()}
            </span>
          </div>
          <div className="flex justify-between text-sm mt-2">
            <span className="text-ink-500">Items</span>
            <span className="font-medium text-ink-800">{confirmed.items.length}</span>
          </div>
          <div className="flex justify-between text-sm mt-2">
            <span className="text-ink-500">Total</span>
            <span className="font-bold text-ink-900">₹{confirmed.total.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between text-sm mt-2">
            <span className="text-ink-500">Payment</span>
            <span className="font-medium text-ink-800">COD</span>
          </div>
        </div>
        <div className="mt-6 flex w-full max-w-xs flex-col gap-2">
          <button type="button" onClick={() => printInvoice(confirmed)} className="btn-primary w-full">
            Print / Save Invoice PDF
          </button>
          <button onClick={onOrderPlaced} className="btn-outline w-full">
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-1 flex-col">
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to cart
        </button>

        {/* Shipping details */}
        <div>
          <h3 className="font-medium text-ink-900 mb-3">Shipping Details</h3>
          <div className="space-y-3">
            <div>
              <input
                type="text"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                placeholder="Full Name"
                className="input-field"
              />
              {errors.full_name && <p className="mt-1 text-xs text-red-500">{errors.full_name}</p>}
            </div>
            <div>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="Phone Number (10 digits)"
                maxLength={10}
                className="input-field"
              />
              {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
            </div>
            <div>
              <textarea
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Shipping Address"
                rows={3}
                className="input-field resize-none"
              />
              {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address}</p>}
            </div>
            <div>
              <input
                type="text"
                value={form.pincode}
                onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                placeholder="Pincode (6 digits)"
                maxLength={6}
                className="input-field"
              />
              {errors.pincode && <p className="mt-1 text-xs text-red-500">{errors.pincode}</p>}
            </div>
          </div>
        </div>

        {/* Payment */}
        <div>
          <h3 className="font-medium text-ink-900 mb-3">Payment Method</h3>
          <div className="rounded-xl border-2 border-ink-900 bg-ink-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-900">
                <Banknote className="h-5 w-5 text-accent-400" />
              </div>
              <div>
                <div className="text-sm font-medium text-ink-900">Cash on Delivery (COD)</div>
                <div className="text-xs text-ink-500">Pay when your order arrives</div>
              </div>
              <div className="ml-auto flex h-5 w-5 items-center justify-center rounded-full border-2 border-ink-900 bg-ink-900">
                <CheckCircle2 className="h-3.5 w-3.5 text-white" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-brand-50 px-3 py-2">
              <Lock className="h-3.5 w-3.5 text-brand-600" />
              <span className="text-xs text-brand-700">Online Payments Coming Soon</span>
            </div>
          </div>
        </div>

        {/* Order summary */}
        <div className="rounded-xl border border-ink-100 bg-white p-4">
          <h3 className="font-medium text-ink-900 mb-3">Order Summary</h3>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-ink-600">
              <span>Subtotal ({items.length} items)</span>
              <span>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-accent-600">
                <span>Discount {appliedCoupon && `(${appliedCoupon.code})`}</span>
                <span>-₹{discount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-ink-900 pt-2 border-t border-ink-100">
              <span>Total</span>
              <span>₹{total.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="border-t border-ink-100 bg-white px-5 py-4">
        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? 'Placing Order...' : `Place Order — ₹${total.toLocaleString('en-IN')}`}
        </button>
      </div>
    </form>
  );
}
