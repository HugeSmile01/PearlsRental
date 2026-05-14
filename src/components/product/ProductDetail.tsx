'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/layout/AuthProvider';
import { useRouter } from 'next/navigation';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import {
  Heart, Share2, ChevronLeft, ChevronRight, ZoomIn,
  Ruler, Palette, Layers, Star, MapPin, CheckCircle, AlertCircle, Clock
} from 'lucide-react';
import toast from 'react-hot-toast';
import { cn, formatCurrency, getStatusColor, getStatusLabel, calculateRentalDays, calculateTotalPrice } from '@/lib/utils';
import { ProductCard } from './ProductCard';
import type { Product } from '@/types';
import { addDays, isBefore, startOfToday } from 'date-fns';

interface Props {
  product: Product;
  related: Product[];
}

export function ProductDetail({ product, related }: Props) {
  const { user: session } = useAuth();
  const router = useRouter();
  const [activeImg, setActiveImg] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [range, setRange] = useState<{ from?: Date; to?: Date }>({});
  const [notes, setNotes] = useState('');
  const [booking, setBooking] = useState(false);

  const images = product.images || [];
  const today = startOfToday();

  const days = range.from && range.to ? calculateRentalDays(range.from, range.to) : 0;
  const total = range.from && range.to ? calculateTotalPrice(product.pricePerDay, range.from, range.to) : 0;

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied!');
  };

  const toggleFavorite = async () => {
    if (!session) { toast.error('Sign in to save favorites'); return; }
    const res = await fetch('/api/user/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: product.id }),
    });
    if (res.ok) {
      const data = await res.json();
      setFavorited(data.favorited);
      toast.success(data.favorited ? 'Added to wishlist' : 'Removed from wishlist');
    }
  };

  const handleRent = async () => {
    if (!session) { router.push('/auth/login'); return; }
    if (!range.from || !range.to) { toast.error('Please select rental dates'); return; }
    setBooking(true);
    try {
      const res = await fetch('/api/rentals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          startDate: range.from.toISOString(),
          endDate: range.to.toISOString(),
          notes,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || 'Reservation failed');
        return;
      }
      const rental = await res.json();
      toast.success('Reservation confirmed!');
      router.push(`/reservation/${rental.id}`);
    } catch {
      toast.error('Something went wrong');
    } finally {
      setBooking(false);
    }
  };

  const infographics = [
    { icon: Ruler, label: 'Size', value: product.size },
    { icon: Palette, label: 'Color', value: product.color },
    { icon: Layers, label: 'Fabric', value: product.fabric },
    { icon: Star, label: 'Occasion', value: product.occasion },
  ];

  return (
    <div className="pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-obsidian-400 mb-8">
          <Link href="/" className="hover:text-gold-600 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/catalog" className="hover:text-gold-600 transition-colors">Catalog</Link>
          <span>/</span>
          <Link href={`/catalog?category=${product.category}`} className="hover:text-gold-600 transition-colors">{product.category}</Link>
          <span>/</span>
          <span className="text-obsidian-700 dark:text-obsidian-300 truncate max-w-[200px]">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-16">
          {/* ── Image Gallery ── */}
          <div className="space-y-4">
            {/* Main image */}
            <div
              className="relative aspect-[3/4] bg-obsidian-100 dark:bg-obsidian-800 rounded-2xl overflow-hidden cursor-zoom-in group"
              onClick={() => setZoomed(!zoomed)}
            >
              {images[activeImg] && (
                <img
                  src={images[activeImg]}
                  alt={product.name}
                  className={cn(
                    'w-full h-full object-cover transition-transform duration-500',
                    zoomed ? 'scale-150' : 'group-hover:scale-105'
                  )}
                />
              )}
              <div className="absolute top-3 right-3 w-8 h-8 bg-white/80 dark:bg-obsidian-900/80 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ZoomIn className="w-4 h-4 text-obsidian-600" />
              </div>
              {/* Nav arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); setActiveImg((i) => (i - 1 + images.length) % images.length); }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 dark:bg-obsidian-900/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white dark:hover:bg-obsidian-900 transition-colors shadow"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setActiveImg((i) => (i + 1) % images.length); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 dark:bg-obsidian-900/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white dark:hover:bg-obsidian-900 transition-colors shadow"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}
              <div className={cn('absolute top-3 left-3 badge', getStatusColor(product.status))}>
                {getStatusLabel(product.status)}
              </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={cn(
                      'w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 shrink-0',
                      i === activeImg ? 'border-gold-500 scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                    )}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Product Info ── */}
          <div className="flex flex-col">
            <div className="flex items-start justify-between gap-4 mb-2">
              <span className="text-gold-600 text-sm font-medium uppercase tracking-wider">{product.category}</span>
              <div className="flex items-center gap-2">
                <button onClick={toggleFavorite} className="btn-ghost p-2">
                  <Heart className={cn('w-5 h-5', favorited ? 'fill-red-500 text-red-500' : '')} />
                </button>
                <button onClick={copyLink} className="btn-ghost p-2">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            <h1 className="font-display text-3xl md:text-4xl font-semibold leading-tight mb-4">{product.name}</h1>

            <div className="flex items-baseline gap-2 mb-6">
              <span className="font-display text-3xl font-semibold text-gold-600">{formatCurrency(product.pricePerDay)}</span>
              <span className="text-obsidian-400">per day</span>
            </div>

            <p className="text-obsidian-600 dark:text-obsidian-300 leading-relaxed mb-8">{product.description}</p>

            {/* Infographics */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              {infographics.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3 p-3 bg-obsidian-50 dark:bg-obsidian-800 rounded-xl">
                  <div className="w-8 h-8 bg-gold-100 dark:bg-gold-900/30 rounded-lg flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-gold-600" />
                  </div>
                  <div>
                    <p className="text-xs text-obsidian-400 uppercase tracking-wide">{label}</p>
                    <p className="text-sm font-medium text-obsidian-800 dark:text-obsidian-200">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Tags */}
            {product.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {product.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-obsidian-100 dark:bg-obsidian-800 text-obsidian-600 dark:text-obsidian-400 text-xs rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Calendar & Booking */}
            {product.status === 'AVAILABLE' ? (
              <div className="card p-5">
                <h3 className="font-display text-lg font-semibold mb-1">Select Rental Dates</h3>
                <p className="text-xs text-obsidian-400 mb-4">Click a start date then an end date</p>

                <div className="flex justify-center">
                  <DayPicker
                    mode="range"
                    selected={{ from: range.from, to: range.to }}
                    onSelect={(r) => setRange(r || {})}
                    disabled={{ before: addDays(today, 1) }}
                    numberOfMonths={1}
                    className="!font-body text-sm"
                  />
                </div>

                {range.from && range.to && (
                  <div className="mt-4 p-3 bg-gold-50 dark:bg-gold-900/20 rounded-xl border border-gold-200 dark:border-gold-800 animate-in">
                    <div className="flex justify-between items-center text-sm mb-1">
                      <span className="text-obsidian-500">Duration</span>
                      <span className="font-medium">{days} day{days !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-obsidian-500 text-sm">Total</span>
                      <span className="font-display text-xl font-semibold text-gold-600">{formatCurrency(total)}</span>
                    </div>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Special notes or requests (optional)"
                      rows={2}
                      className="input mt-3 text-xs resize-none"
                    />
                  </div>
                )}

                <button
                  onClick={handleRent}
                  disabled={booking || !range.from || !range.to}
                  className="btn-primary w-full mt-4 py-3.5 text-base"
                >
                  {booking ? 'Reserving...' : 'Reserve Now — Cash on Pickup'}
                </button>

                <div className="flex items-center gap-2 mt-3 justify-center text-xs text-obsidian-400">
                  <MapPin className="w-3.5 h-3.5" />
                  Pick up at our Makati store · Pay in cash
                </div>
              </div>
            ) : (
              <div className="card p-5 text-center">
                <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
                <h3 className="font-display text-lg font-semibold mb-1">Currently Unavailable</h3>
                <p className="text-sm text-obsidian-400">This item is {getStatusLabel(product.status).toLowerCase()}. Check back soon or browse similar items below.</p>
              </div>
            )}

            {/* Pickup info strip */}
            <div className="mt-4 flex items-center gap-6 text-xs text-obsidian-400 border-t border-obsidian-100 dark:border-obsidian-800 pt-4">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                No online payment
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-gold-500" />
                Reserve expires in 24h
              </div>
            </div>
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div className="mt-20">
            <div className="mb-8">
              <p className="text-gold-600 text-sm font-medium uppercase tracking-widest mb-2">You May Also Like</p>
              <h2 className="font-display text-2xl font-semibold">More {product.category}</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {related.map((r) => <ProductCard key={r.id} product={r as any} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
