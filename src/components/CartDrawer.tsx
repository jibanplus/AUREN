import { useState, useEffect } from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, Tag, Check } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import type { Coupon } from '@/lib/types';
import { CheckoutForm } from './CheckoutForm';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  coupons: Coupon[];
  onRequireAuth: () => void;
  onOrderPlaced: () => void;
}

export function CartDrawer({ open, onClose, coupons, onRequireAuth, onOrderPlaced }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, subtotal, clearCart } = useCart();
  const { toast } = useToast();
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => {
    if (!open) {
      setShowCheckout(false);
    }
  }, [open]);

  const discount = appliedCoupon
    ? appliedCoupon.discount_type === 'flat'
      ? Math.min(appliedCoupon.discount_value, subtotal)
      : Math.round((subtotal * appliedCoupon.discount_value) / 100)
    : 0;
  const total = Math.max(subtotal - discount, 0);

  const handleApplyCoupon = () => {
    setCouponError('');
    const code = couponCode.trim().toUpperCase();
    if (!code) return;
    const coupon = coupons.find((c) => c.code.toUpperCase() === code && c.is_active);
    if (!coupon) {
      setAppliedCoupon(null);
      setCouponError('Invalid or expired code');
      return;
    }
    if (coupon.expiry_date && new Date(coupon.expiry_date) < new Date()) {
      setAppliedCoupon(null);
      setCouponError('This coupon has expired');
      return;
    }
    if (subtotal < coupon.min_order_value) {
      setAppliedCoupon(null);
      setCouponError(`Minimum order ₹${coupon.min_order_value} required`);
      return;
    }
    setAppliedCoupon(coupon);
    toast(`Coupon "${coupon.code}" applied!`, 'success');
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-ink-950/50 backdrop-blur-sm animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 z-50 h-full w-full max-w-md bg-ink-50 shadow-2xl transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-ink-100 bg-white px-5 py-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-ink-700" />
              <h2 className="font-display text-xl font-semibold text-ink-900">
                {showCheckout ? 'Checkout' : 'Your Cart'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full text-ink-500 hover:bg-ink-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {showCheckout ? (
            <CheckoutForm
              subtotal={subtotal}
              discount={discount}
              total={total}
              appliedCoupon={appliedCoupon}
              onBack={() => setShowCheckout(false)}
              onRequireAuth={onRequireAuth}
              onOrderPlaced={() => {
                clearCart();
                handleRemoveCoupon();
                onClose();
                onOrderPlaced();
              }}
            />
          ) : (
            <>
              {/* Cart items */}
              <div className="flex-1 overflow-y-auto px-5 py-4">
                {items.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <ShoppingBag className="h-16 w-16 text-ink-200 mb-4" />
                    <p className="text-lg font-medium text-ink-700">Your cart is empty</p>
                    <p className="text-sm text-ink-400 mt-1">Add some products to get started</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div
                        key={`${item.product_id}-${item.size}`}
                        className="flex gap-3 rounded-xl border border-ink-100 bg-white p-3"
                      >
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="h-20 w-20 shrink-0 rounded-lg object-cover"
                        />
                        <div className="flex flex-1 flex-col">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-sm font-medium text-ink-900 line-clamp-1">{item.title}</h4>
                            <button
                              onClick={() => removeItem(item.product_id, item.size)}
                              className="shrink-0 text-ink-400 hover:text-red-500"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          {item.size && (
                            <span className="text-xs text-ink-500 mt-0.5">Size: {item.size}</span>
                          )}
                          <div className="mt-auto flex items-center justify-between">
                            <div className="flex items-center gap-1.5 rounded-lg border border-ink-200">
                              <button
                                onClick={() => updateQuantity(item.product_id, item.size, item.quantity - 1)}
                                className="flex h-7 w-7 items-center justify-center text-ink-600 hover:bg-ink-100 rounded-l-lg"
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              <span className="w-7 text-center text-sm font-medium">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.product_id, item.size, item.quantity + 1)}
                                className="flex h-7 w-7 items-center justify-center text-ink-600 hover:bg-ink-100 rounded-r-lg"
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <span className="text-sm font-bold text-ink-900">
                              ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Coupon + summary */}
              {items.length > 0 && (
                <div className="border-t border-ink-100 bg-white px-5 py-4 space-y-4">
                  {/* Coupon field */}
                  <div>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => {
                            setCouponCode(e.target.value);
                            setCouponError('');
                          }}
                          placeholder="Enter coupon code"
                          className="w-full rounded-xl border border-ink-200 bg-ink-50 pl-10 pr-4 py-2.5 text-sm focus:border-ink-900 focus:bg-white focus:outline-none"
                        />
                      </div>
                      <button
                        onClick={handleApplyCoupon}
                        className="rounded-xl bg-ink-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-ink-800"
                      >
                        Apply
                      </button>
                    </div>
                    {couponError && (
                      <p className="mt-1.5 text-xs text-red-500">{couponError}</p>
                    )}
                    {appliedCoupon && (
                      <div className="mt-2 flex items-center gap-2 rounded-lg bg-accent-50 px-3 py-2">
                        <Check className="h-4 w-4 text-accent-600" />
                        <span className="text-xs font-medium text-accent-700">
                          {appliedCoupon.code} applied
                        </span>
                        <button
                          onClick={handleRemoveCoupon}
                          className="ml-auto text-accent-600 hover:text-accent-800"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Totals */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm text-ink-600">
                      <span>Subtotal</span>
                      <span>₹{subtotal.toLocaleString('en-IN')}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-sm text-accent-600">
                        <span>Discount</span>
                        <span>-₹{discount.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-base font-bold text-ink-900 pt-2 border-t border-ink-100">
                      <span>Total</span>
                      <span>₹{total.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowCheckout(true)}
                    className="btn-primary w-full"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
