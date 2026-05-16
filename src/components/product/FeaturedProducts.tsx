'use client';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ProductCard, ProductCardSkeleton } from './ProductCard';
import type { Product } from '@/types';

export function FeaturedProducts() {
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ['products', 'featured'],
    queryFn: async () => {
      const response = await fetch('/api/products?featured=true');
      if (!response.ok) return [];
      const payload = await response.json();
      return Array.isArray(payload) ? payload : [];
    },
  });

  return (
    <section className="py-24 bg-obsidian-50 dark:bg-obsidian-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-gold-600 text-sm font-medium uppercase tracking-widest mb-3">Our Collection</p>
            <h2 className="section-title">Featured Pieces</h2>
          </div>
          <Link href="/catalog" className="btn-ghost hidden sm:flex items-center gap-2 text-sm">
            View all
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 lg:gap-6">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : products?.map((p) => <ProductCard key={p.id} product={p} />)
          }
        </div>

        <div className="text-center mt-12 sm:hidden">
          <Link href="/catalog" className="btn-secondary">
            View full catalog
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
