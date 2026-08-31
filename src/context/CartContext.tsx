import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export interface CartItem {
  product_id: string;
  title: string;
  image_url: string;
  price: number;
  size: string | null;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (product_id: string, size: string | null) => void;
  updateQuantity: (product_id: string, size: string | null, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
}

const CartContext = createContext<CartContextValue | null>(null);

const CART_KEY = 'auren_cart';

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  } catch {
    /* ignore */
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadCart);

  const persist = (next: CartItem[]) => {
    setItems(next);
    saveCart(next);
  };

  const addItem = useCallback((item: Omit<CartItem, 'quantity'>) => {
    setItems((prev) => {
      const idx = prev.findIndex((x) => x.product_id === item.product_id && x.size === item.size);
      let next: CartItem[];
      if (idx >= 0) {
        next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
      } else {
        next = [...prev, { ...item, quantity: 1 }];
      }
      saveCart(next);
      return next;
    });
  }, []);

  const removeItem = useCallback((product_id: string, size: string | null) => {
    setItems((prev) => {
      const next = prev.filter((x) => !(x.product_id === product_id && x.size === size));
      saveCart(next);
      return next;
    });
  }, []);

  const updateQuantity = useCallback((product_id: string, size: string | null, quantity: number) => {
    if (quantity < 1) return;
    setItems((prev) => {
      const next = prev.map((x) =>
        x.product_id === product_id && x.size === size ? { ...x, quantity } : x,
      );
      saveCart(next);
      return next;
    });
  }, []);

  const clearCart = useCallback(() => {
    persist([]);
  }, []);

  const totalItems = items.reduce((sum, x) => sum + x.quantity, 0);
  const subtotal = items.reduce((sum, x) => sum + x.price * x.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, subtotal }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
