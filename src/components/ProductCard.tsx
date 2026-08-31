import { useState } from 'react';
import { Plus, Check } from 'lucide-react';
import type { Product } from '@/lib/types';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { toast } = useToast();
  const [added, setAdded] = useState(false);

  const discountPercent = Math.round(
    ((product.original_price - product.selling_price) / product.original_price) * 100,
  );

  const handleAdd = () => {
    addItem({
      product_id: product.id,
      title: product.name,
      image_url: product.image,
      price: product.selling_price,
      size: null,
    });
    setAdded(true);
    toast(`${product.name} added to cart`, 'success');
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white transition-all hover:shadow-xl hover:border-ink-200">
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-ink-100">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {discountPercent > 0 && (
          <span className="absolute top-3 left-3 chip bg-brand-500 text-white font-bold">
            -{discountPercent}%
          </span>
        )}
        <span className="absolute top-3 right-3 chip bg-white/90 text-ink-700 backdrop-blur">
          {product.category}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-medium text-ink-900 line-clamp-1">{product.name}</h3>
        {product.description && (
          <p className="mt-1 text-xs text-ink-500 line-clamp-2">{product.description}</p>
        )}

        {/* Price + action */}
        <div className="mt-auto flex items-end justify-between gap-2 pt-3 border-t border-ink-100">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-ink-900">
                ₹{product.selling_price.toLocaleString('en-IN')}
              </span>
              {product.original_price > product.selling_price && (
                <span className="text-sm text-ink-400 line-through">
                  ₹{product.original_price.toLocaleString('en-IN')}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={handleAdd}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-900 text-white transition-all hover:bg-ink-800 active:scale-90"
            aria-label="Add to cart"
          >
            {added ? <Check className="h-5 w-5 text-accent-400" /> : <Plus className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
