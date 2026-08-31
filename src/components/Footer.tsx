import { ShoppingBag, Lock, Instagram, Twitter, Facebook } from 'lucide-react';

interface FooterProps {
  onAdminClick: () => void;
}

export function Footer({ onAdminClick }: FooterProps) {
  return (
    <footer className="bg-ink-900 text-ink-300 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
                <ShoppingBag className="h-5 w-5 text-brand-300" />
              </div>
              <span className="font-display text-2xl font-semibold text-white">
                AUREN
              </span>
            </div>
            <p className="text-sm text-ink-400 max-w-sm">
              Premium fashion & apparel for the modern wardrobe. Shop the latest trends with
              Cash on Delivery across India.
            </p>
            <div className="flex items-center gap-3 mt-5">
              {[Instagram, Twitter, Facebook].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-ink-400 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label="Social link"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#shop" className="hover:text-white transition-colors">All Products</a></li>
              <li><a href="#shop" className="hover:text-white transition-colors">Men</a></li>
              <li><a href="#shop" className="hover:text-white transition-colors">Women</a></li>
              <li><a href="#shop" className="hover:text-white transition-colors">Trendy</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Shipping Info</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Returns</a></li>
              <li><a href="#" className="hover:text-white transition-colors">FAQs</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-ink-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-ink-500">
            © {new Date().getFullYear()} AUREN. All rights reserved.
          </p>
          <button
            onClick={onAdminClick}
            className="flex items-center gap-1.5 text-xs text-ink-500 hover:text-white transition-colors"
          >
            <Lock className="h-3.5 w-3.5" />
            Admin
          </button>
        </div>
      </div>
    </footer>
  );
}
