import { useState } from 'react';
import { Copy, Check, Ticket, Tag } from 'lucide-react';
import type { Coupon } from '@/lib/types';
import { useToast } from '@/context/ToastContext';

interface CouponShowcaseProps {
  coupons: Coupon[];
}

export function CouponShowcase({ coupons }: CouponShowcaseProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const { toast } = useToast();

  const activeCoupons = coupons.filter((c) => c.is_active).slice(0, 3);
  if (activeCoupons.length === 0) return null;

  const handleCopy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast(`Code "${code}" copied to clipboard!`, 'success');
      setTimeout(() => setCopiedCode(null), 2000);
    } catch {
      toast('Failed to copy code', 'error');
    }
  };

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center gap-2 mb-6">
        <Ticket className="h-5 w-5 text-brand-500" />
        <h2 className="font-display text-2xl font-semibold text-ink-900">Active Coupons</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeCoupons.map((coupon) => {
          const discount =
            coupon.discount_type === 'flat'
              ? `₹${coupon.discount_value} OFF`
              : `${coupon.discount_value}% OFF`;
          const minText =
            coupon.min_order_value > 0
              ? `Min order ₹${coupon.min_order_value}`
              : 'No minimum order';

          return (
            <div
              key={coupon.id}
              className="group relative overflow-hidden rounded-2xl border-2 border-dashed border-ink-200 bg-white p-5 transition-all hover:border-brand-400 hover:shadow-lg"
            >
              {/* Notch circles */}
              <div className="absolute -left-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-ink-50" />
              <div className="absolute -right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-ink-50" />

              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-1.5 chip bg-brand-50 text-brand-700 mb-2">
                    <Tag className="h-3 w-3" />
                    {discount}
                  </div>
                  <div className="font-mono text-lg font-bold tracking-wider text-ink-900">
                    {coupon.code}
                  </div>
                  <p className="text-xs text-ink-500 mt-1">{minText}</p>
                </div>
                <button
                  onClick={() => handleCopy(coupon.code)}
                  className="flex items-center gap-1.5 rounded-lg bg-ink-900 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-ink-800 active:scale-95"
                >
                  {copiedCode === coupon.code ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-accent-400" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
