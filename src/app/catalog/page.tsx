'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { ProductCard, ProductCardSkeleton } from '@/components/product/ProductCard';
import type { Product } from '@/types';
import { cn } from '@/lib/utils';

const CATEGORIES = ['All', 'Gowns', 'Suits', 'Dresses', 'Blazers', 'Traditional'];
const SIZES = ['All', 'XS', 'S', 'M', 'L', 'XL', 'XXL'];
const STATUSES = ['All', 'AVAILABLE', 'RESERVED'];

export default function CatalogPage() {
  const sp = useSearchParams();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(sp.get('category') || '');
  const [size, setSize] = useState('');
  const [status, setStatus] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    const cat = sp.get('category') || '';
    setCategory(cat);
  }, [sp]);

  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (category) params.set('category', category);
  if (size) params.set('size', size);
  if (status) params.set('status', status);
  params.set('sortBy', sortBy);

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ['products', search, category, size, status, sortBy],
    queryFn: () => fetch(`/api/products?${params}`).then((r) => r.json()),
  });

  const hasFilters = search || category || size || status;

  return (
    <div className="pt-16 min-h-screen">
      {/* Header */}
      <div className="bg-obsidian-900 dark:bg-obsidian-950 pt-16 pb-12">
        <div className="section">
          <h1 className="text-h2 text-white mb-2">
            {category || 'Full Catalog'}
          </h1>
          <p className="text-obsidian-400">{products?.length ?? '...'} pieces available</p>

          {/* Search */}
          <div className="mt-6 relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-obsidian-400" />
            <input
              type="text"
              placeholder="Search by name, style, occasion..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-obsidian-800 border border-obsidian-700 rounded-xl text-white placeholder:text-obsidian-500 focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 text-sm transition-all"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat === 'All' ? '' : cat)}
                className={cn(
                  'h-9 px-4 rounded-full text-sm font-medium border transition-all duration-200',
                  (cat === 'All' && !category) || cat === category
                    ? 'bg-gold-600 border-gold-600 text-white'
                    : 'border-obsidian-200 dark:border-obsidian-700 text-obsidian-600 dark:text-obsidian-400 hover:border-gold-400'
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className={cn('btn-ghost text-sm', filtersOpen && 'bg-obsidian-100 dark:bg-obsidian-800')}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {hasFilters && <span className="w-1.5 h-1.5 bg-gold-500 rounded-full" />}
            </button>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input text-sm w-auto min-w-44"
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Filter panel */}
        {filtersOpen && (
          <div className="card p-5 mb-6 grid grid-cols-2 md:grid-cols-4 gap-4 animate-in">
            <div>
              <label className="label">Size</label>
              <select value={size} onChange={(e) => setSize(e.target.value === 'All' ? '' : e.target.value)} className="input text-sm">
                {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Availability</label>
              <select value={status} onChange={(e) => setStatus(e.target.value === 'All' ? '' : e.target.value)} className="input text-sm">
                {STATUSES.map((s) => <option key={s} value={s}>{s === 'All' ? 'All' : s === 'AVAILABLE' ? 'Available' : 'Reserved'}</option>)}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => { setSize(''); setStatus(''); setSearch(''); setCategory(''); }}
                className="btn-danger btn-sm"
              >
                <X className="w-3.5 h-3.5" />
                Clear filters
              </button>
            </div>
          </div>
        )}

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : products?.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">👗</div>
            <h3 className="font-display text-2xl mb-2">No items found</h3>
            <p className="text-obsidian-500 mb-6">Try adjusting your filters or search query</p>
            <button onClick={() => { setSearch(''); setCategory(''); setSize(''); setStatus(''); }} className="btn-primary">
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {products?.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
