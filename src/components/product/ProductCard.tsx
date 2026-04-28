'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Heart } from 'lucide-react';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { cn, formatCurrency, getStatusColor, getStatusLabel } from '@/lib/utils';
import type { Product } from '@/types';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
  isFavorited?: boolean;
  onFavoriteToggle?: (productId: string) => void;
}

export function ProductCard({ product, isFavorited = false, onFavoriteToggle }: ProductCardProps) {
  const { data: session } = useSession();
  const [imgError, setImgError] = useState(false);
  const [favorited, setFavorited] = useState(isFavorited);

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!session) { toast.error('Sign in to save favorites'); return; }
    const res = await fetch('/api/user/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: product.id }),
    });
    if (res.ok) {
      const data = await res.json();
      setFavorited(data.favorited);
      onFavoriteToggle?.(product.id);
    }
  };

  const image = product.images?.[0];

  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="card overflow-hidden h-full flex flex-col">
        {/* Image */}
        <div className="relative aspect-[3/4] bg-obsidian-100 dark:bg-obsidian-800 overflow-hidden">
          {image && !imgError ? (
            <Image
              src={image}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-obsidian-300 text-sm">No image</span>
            </div>
          )}

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-obsidian-900/0 group-hover:bg-obsidian-900/20 transition-colors duration-300" />

          {/* Status badge */}
          <div className="absolute top-3 left-3">
            <span className={cn('badge text-xs', getStatusColor(product.status))}>
              {getStatusLabel(product.status)}
            </span>
          </div>

          {/* Favorite button */}
          <button
            onClick={handleFavorite}
            className="absolute top-3 right-3 w-8 h-8 bg-white dark:bg-obsidian-900 rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
          >
            <Heart className={cn('w-4 h-4', favorited ? 'fill-red-500 text-red-500' : 'text-obsidian-500')} />
          </button>
        </div>

        {/* Info */}
        <div className="p-4 flex flex-col flex-1">
          <p className="text-xs text-obsidian-400 dark:text-obsidian-500 uppercase tracking-wider mb-1">{product.category}</p>
          <h3 className="font-display text-base font-medium leading-snug mb-2 line-clamp-2 group-hover:text-gold-600 transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center gap-2 text-xs text-obsidian-500 dark:text-obsidian-400 mb-3">
            <span>{product.size}</span>
            <span>·</span>
            <span>{product.color}</span>
          </div>
          <div className="mt-auto flex items-end justify-between">
            <div>
              <span className="font-display text-lg font-semibold text-gold-600">{formatCurrency(product.pricePerDay)}</span>
              <span className="text-obsidian-400 text-xs ml-1">/ day</span>
            </div>
            <span className="text-xs text-obsidian-400 group-hover:text-gold-600 transition-colors">View →</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="aspect-[3/4] skeleton" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-3 w-16 rounded" />
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
        <div className="skeleton h-5 w-24 rounded mt-2" />
      </div>
    </div>
  );
}
