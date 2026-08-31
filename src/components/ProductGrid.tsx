import { useMemo, useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import type { Product, Category } from '@/lib/types';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  searchQuery: string;
}

type Filter = 'All' | Category;

const FILTERS: Filter[] = ['All', 'Men', 'Women', 'Trendy'];

export function ProductGrid({ products, searchQuery }: ProductGridProps) {
  const [filter, setFilter] = useState<Filter>('All');
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'discount'>('featured');

  const filtered = useMemo(() => {
    let list = products;
    if (filter !== 'All') list = list.filter((p) => p.category === filter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q),
      );
    }
    const sorted = [...list];
    switch (sortBy) {
      case 'price-low':
        sorted.sort((a, b) => a.selling_price - b.selling_price);
        break;
      case 'price-high':
        sorted.sort((a, b) => b.selling_price - a.selling_price);
        break;
      case 'discount':
        sorted.sort(
          (a, b) =>
            (b.original_price - b.selling_price) / b.original_price -
            (a.original_price - a.selling_price) / a.original_price,
        );
        break;
    }
    return sorted;
  }, [products, filter, sortBy, searchQuery]);

  return (
    <section id="shop" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Header + filters */}
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-semibold text-ink-900">Shop the Collection</h2>
            <p className="text-sm text-ink-500 mt-1">
              {filtered.length} {filtered.length === 1 ? 'item' : 'items'}
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-ink-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-700 focus:border-ink-900 focus:outline-none"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="discount">Biggest Discount</option>
            </select>
          </div>
        </div>

        {/* Category filter chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`shrink-0 rounded-full px-5 py-2 text-sm font-medium transition-all ${
                filter === f
                  ? 'bg-ink-900 text-white'
                  : 'bg-white border border-ink-200 text-ink-600 hover:border-ink-400'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Search className="h-12 w-12 text-ink-300 mb-4" />
          <p className="text-lg font-medium text-ink-700">No products found</p>
          <p className="text-sm text-ink-400 mt-1">Try a different search or filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
