import { Megaphone, X } from 'lucide-react';
import { useState } from 'react';
import type { Coupon } from '@/lib/types';

interface AlertBarProps {
  promoText: string;
  coupons: Coupon[];
}

export function AlertBar({ promoText, coupons }: AlertBarProps) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  const activeCoupons = coupons.filter((c) => c.is_active);
  const items = [
    promoText,
    ...activeCoupons.map((c) => {
      const disc =
        c.discount_type === 'flat'
          ? `₹${c.discount_value} off`
          : `${c.discount_value}% off`;
      return `Use code ${c.code} for ${disc}`;
    }),
  ];

  return (
    <div className="relative bg-ink-900 text-white overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5">
        <Megaphone className="h-4 w-4 shrink-0 text-brand-300" />
        <div className="flex-1 overflow-hidden">
          <div className="flex gap-8 whitespace-nowrap animate-marquee">
            {[...items, ...items].map((text, i) => (
              <span key={i} className="text-xs font-medium tracking-wide">
                {text}
              </span>
            ))}
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="shrink-0 text-ink-300 hover:text-white transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
