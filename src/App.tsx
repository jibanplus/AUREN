import { useState, useEffect, useCallback } from 'react';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider, useToast } from '@/context/ToastContext';
import { Navbar } from '@/components/Navbar';
import { AlertBar } from '@/components/AlertBar';
import { Hero } from '@/components/Hero';
import { CouponShowcase } from '@/components/CouponShowcase';
import { ProductGrid } from '@/components/ProductGrid';
import { CartDrawer } from '@/components/CartDrawer';
import { ProfileModal } from '@/components/ProfileModal';
import { Footer } from '@/components/Footer';
import { AdminPanel } from '@/components/AdminPanel';
import { AdminPinGate } from '@/components/AdminPinGate';
import { AuthModal } from '@/components/AuthModal';
import { fetchProducts, fetchCoupons, fetchActiveOffer } from '@/lib/store';
import type { Product, Coupon, Offer } from '@/lib/types';

function AppContent() {
  const { toast } = useToast();
  const [page, setPage] = useState('Home');
  const [isAdminRoute, setIsAdminRoute] = useState(false);
  const [pinUnlocked, setPinUnlocked] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [p, c, o] = await Promise.all([fetchProducts(), fetchCoupons(), fetchActiveOffer()]);
      setProducts(p);
      setCoupons(c);
      setOffer(o);
    } catch (error) {
      console.error('Data loading error:', error);
      toast('Failed to load data. Using demo mode.', 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Simple hash-based routing for /admin
  useEffect(() => {
    const checkRoute = () => {
      const path = window.location.pathname;
      setIsAdminRoute(path === '/admin');
    };
    checkRoute();
    window.addEventListener('popstate', checkRoute);
    return () => window.removeEventListener('popstate', checkRoute);
  }, []);

  const handleNavigate = (p: string) => {
    setPage(p);
    if (p === 'Shop') {
      setTimeout(() => {
        document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else if (p === 'Home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (p === 'Offers') {
      setTimeout(() => {
        document.getElementById('coupons')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const handleAdminClick = () => {
    window.history.pushState({}, '', '/admin');
    setIsAdminRoute(true);
    setPinUnlocked(false);
  };

  const handleExitAdmin = () => {
    window.history.pushState({}, '', '/');
    setIsAdminRoute(false);
    setPinUnlocked(false);
  };

  if (isAdminRoute) {
    if (!pinUnlocked) {
      return <AdminPinGate onSuccess={() => setPinUnlocked(true)} onExit={handleExitAdmin} />;
    }
    return <AdminPanel />;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AlertBar promoText={offer?.promo_text ?? 'Free shipping on all orders above ₹999'} coupons={coupons} />
      <Navbar
        onCartClick={() => setCartOpen(true)}
        onProfileClick={() => setProfileOpen(true)}
        onAuthClick={() => setAuthOpen(true)}
        onSearch={setSearchQuery}
        activePage={page}
        onNavigate={handleNavigate}
      />

      <main className="flex-1">
        {loading ? (
          <div className="flex items-center justify-center py-40">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-ink-200 border-t-ink-900" />
          </div>
        ) : (
          <>
            <Hero offer={offer} onShopNow={() => handleNavigate('Shop')} />
            <div id="coupons">
              <CouponShowcase coupons={coupons} />
            </div>
            <ProductGrid products={products} searchQuery={searchQuery} />
          </>
        )}
      </main>

      <Footer onAdminClick={handleAdminClick} />

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        coupons={coupons}
        onOrderPlaced={() => {
          toast('Order placed! View it in your profile.', 'success');
          loadData();
        }}
      />
      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
