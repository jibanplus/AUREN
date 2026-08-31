import { ShoppingBag, Search, User, Menu, X, LogOut, Shield } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

interface NavbarProps {
  onCartClick: () => void;
  onProfileClick: () => void;
  onAuthClick: () => void;
  onSearch: (query: string) => void;
  activePage: string;
  onNavigate: (page: string) => void;
}

export function Navbar({ onCartClick, onProfileClick, onAuthClick, onSearch, activePage, onNavigate }: NavbarProps) {
  const { totalItems } = useCart();
  const { user, profile, signOut } = useAuth();
  const [query, setQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navLinks = ['Home', 'Shop', 'Offers'];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
    onNavigate('Shop');
    setMobileOpen(false);
  };

  const handleProfileClick = () => {
    if (user) {
      onProfileClick();
    } else {
      onAuthClick();
    }
    setUserMenuOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    setUserMenuOpen(false);
    onNavigate('Home');
  };

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User';

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-ink-100">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <button onClick={() => onNavigate('Home')} className="flex items-center gap-2 shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-900">
              <ShoppingBag className="h-5 w-5 text-brand-300" />
            </div>
            <span className="font-display text-2xl font-semibold tracking-tight text-ink-900">
              AUREN
            </span>
          </button>

          {/* Nav links - desktop */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link}
                onClick={() => onNavigate(link)}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                  activePage === link
                    ? 'text-ink-900 bg-ink-100'
                    : 'text-ink-500 hover:text-ink-900'
                }`}
              >
                {link}
              </button>
            ))}
          </div>

          {/* Search - desktop */}
          <form onSubmit={handleSearch} className="hidden lg:flex flex-1 max-w-xs">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full rounded-full border border-ink-200 bg-ink-50 pl-10 pr-4 py-2 text-sm text-ink-900 placeholder:text-ink-400 transition-colors focus:border-ink-900 focus:bg-white focus:outline-none"
              />
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Profile / Auth */}
            <div className="relative">
              <button
                onClick={() => (user ? setUserMenuOpen((v) => !v) : onAuthClick())}
                className="flex items-center gap-2 rounded-full p-1 pr-2 text-ink-600 hover:bg-ink-100 hover:text-ink-900 transition-colors"
                aria-label="Profile"
              >
                {user ? (
                  <>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ink-900 text-xs font-bold text-white">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                    {profile?.is_admin && <Shield className="h-3.5 w-3.5 text-brand-500" />}
                  </>
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center">
                    <User className="h-5 w-5" />
                  </div>
                )}
              </button>

              {/* User dropdown */}
              {user && userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-ink-100 bg-white shadow-lg z-50 animate-fade-in">
                    <div className="px-4 py-3 border-b border-ink-100">
                      <p className="text-sm font-medium text-ink-900 truncate">{displayName}</p>
                      <p className="text-xs text-ink-500 truncate">{user.email}</p>
                      {profile?.is_admin && (
                        <span className="inline-flex items-center gap-1 mt-1.5 chip bg-brand-50 text-brand-700">
                          <Shield className="h-3 w-3" /> Admin
                        </span>
                      )}
                    </div>
                    <div className="p-1">
                      <button
                        onClick={handleProfileClick}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink-700 hover:bg-ink-50"
                      >
                        <User className="h-4 w-4" /> My Profile & Orders
                      </button>
                      <button
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={onCartClick}
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-ink-600 hover:bg-ink-100 hover:text-ink-900 transition-colors"
              aria-label="Cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1 text-[10px] font-bold text-white">
                  {totalItems}
                </span>
              )}
            </button>
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden flex h-10 w-10 items-center justify-center rounded-full text-ink-600 hover:bg-ink-100"
              aria-label="Menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 animate-fade-in">
            <form onSubmit={handleSearch} className="mb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full rounded-full border border-ink-200 bg-ink-50 pl-10 pr-4 py-2 text-sm focus:border-ink-900 focus:bg-white focus:outline-none"
                />
              </div>
            </form>
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <button
                  key={link}
                  onClick={() => {
                    onNavigate(link);
                    setMobileOpen(false);
                  }}
                  className={`px-4 py-2.5 text-left text-sm font-medium rounded-lg transition-colors ${
                    activePage === link ? 'text-ink-900 bg-ink-100' : 'text-ink-600 hover:bg-ink-50'
                  }`}
                >
                  {link}
                </button>
              ))}
              {!user && (
                <button
                  onClick={() => {
                    onAuthClick();
                    setMobileOpen(false);
                  }}
                  className="px-4 py-2.5 text-left text-sm font-medium rounded-lg text-brand-600 hover:bg-brand-50"
                >
                  Sign In / Sign Up
                </button>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
