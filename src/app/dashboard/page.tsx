'use client';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Package, Heart, User, Bell, Calendar, Clock, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { cn, formatCurrency, formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';
import type { Rental } from '@/types';
import toast from 'react-hot-toast';

type Tab = 'rentals' | 'favorites' | 'profile';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [tab, setTab] = useState<Tab>('rentals');
  const qc = useQueryClient();

  if (status === 'unauthenticated') redirect('/auth/login');

  const { data: rentals = [], isLoading: rentalsLoading } = useQuery<Rental[]>({
    queryKey: ['my-rentals'],
    queryFn: () => fetch('/api/rentals').then((r) => r.json()),
    enabled: !!session,
  });

  const { data: favorites = [], isLoading: favLoading } = useQuery<any[]>({
    queryKey: ['favorites'],
    queryFn: () => fetch('/api/user/favorites').then((r) => r.json()),
    enabled: tab === 'favorites' && !!session,
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/rentals/${id}`, { method: 'DELETE' }).then((r) => r.json()),
    onSuccess: () => { toast.success('Reservation cancelled'); qc.invalidateQueries({ queryKey: ['my-rentals'] }); },
  });

  const active = rentals.filter((r) => ['RESERVED_UNPAID', 'PICKED_UP_PAID'].includes(r.status));
  const past = rentals.filter((r) => !['RESERVED_UNPAID', 'PICKED_UP_PAID'].includes(r.status));
  const unpaid = rentals.filter((r) => r.status === 'RESERVED_UNPAID');
  const amountAtRisk = unpaid.reduce((sum, r) => sum + r.totalPrice, 0);
  const upcomingPickup = active
    .slice()
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())[0];

  const tabs: { id: Tab; label: string; icon: any; count?: number }[] = [
    { id: 'rentals', label: 'My Rentals', icon: Package, count: rentals.length },
    { id: 'favorites', label: 'Wishlist', icon: Heart },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const RentalCard = ({ rental }: { rental: Rental }) => {
    const product = rental.product;
    const img = product?.images?.[0];
    const isExpiringSoon = rental.status === 'RESERVED_UNPAID' &&
      new Date(rental.expiresAt).getTime() - Date.now() < 6 * 60 * 60 * 1000;

    return (
      <div className="card p-4 flex gap-4 items-start">
        {img && <img src={img} alt={product?.name} className="w-16 h-20 object-cover rounded-lg shrink-0" />}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <Link href={`/product/${product?.slug}`} className="font-display text-sm font-semibold hover:text-gold-600 transition-colors line-clamp-2">
              {product?.name}
            </Link>
            <span className={cn('badge text-xs shrink-0', getStatusColor(rental.status))}>
              {getStatusLabel(rental.status)}
            </span>
          </div>
          <p className="text-xs text-obsidian-400 mb-2">{formatDate(rental.startDate)} → {formatDate(rental.endDate)}</p>
          {isExpiringSoon && (
            <div className="flex items-center gap-1.5 text-xs text-amber-600 mb-2">
              <AlertCircle className="w-3.5 h-3.5" />
              Expires soon — pick up ASAP!
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="font-display text-base font-semibold text-gold-600">{formatCurrency(rental.totalPrice)}</span>
            {rental.status === 'RESERVED_UNPAID' && (
              <button
                onClick={() => cancelMutation.mutate(rental.id)}
                className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors"
              >
                <XCircle className="w-3.5 h-3.5" />
                Cancel
              </button>
            )}
            {rental.status === 'RESERVED_UNPAID' && (
              <Link href={`/reservation/${rental.id}`} className="text-xs text-gold-600 hover:underline">
                View details →
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="pt-16 min-h-screen">
      {/* Header */}
      <div className="bg-obsidian-900 dark:bg-obsidian-950 pt-14 pb-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gold-600 rounded-2xl flex items-center justify-center text-white font-display text-xl font-semibold">
              {session?.user?.name?.[0] || 'U'}
            </div>
            <div>
              <h1 className="font-display text-2xl font-semibold text-white">{session?.user?.name}</h1>
              <p className="text-obsidian-400 text-sm">{session?.user?.email}</p>
            </div>
          </div>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            {[
              { label: 'Total Rentals', value: rentals.length, icon: Package },
              { label: 'Active', value: active.length, icon: Clock },
              { label: 'Completed', value: past.filter((r) => r.status === 'RETURNED').length, icon: CheckCircle2 },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="bg-obsidian-800/60 rounded-xl p-4 text-center">
                <Icon className="w-5 h-5 text-gold-400 mx-auto mb-1" />
                <p className="font-display text-2xl font-semibold text-white">{value}</p>
                <p className="text-obsidian-400 text-xs">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-1 bg-obsidian-100 dark:bg-obsidian-800 rounded-xl p-1 mb-8 w-fit">
          {tabs.map(({ id, label, icon: Icon, count }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                tab === id
                  ? 'bg-white dark:bg-obsidian-900 text-obsidian-900 dark:text-white shadow-sm'
                  : 'text-obsidian-500 hover:text-obsidian-700'
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
              {count !== undefined && count > 0 && (
                <span className="bg-gold-100 dark:bg-gold-900/30 text-gold-700 dark:text-gold-400 text-xs px-1.5 py-0.5 rounded-full">{count}</span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === 'rentals' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="card p-4">
                <p className="text-xs uppercase tracking-wider text-obsidian-400">Next Pickup</p>
                <p className="font-display text-lg font-semibold mt-1">
                  {upcomingPickup ? formatDate(upcomingPickup.startDate) : 'No upcoming pickup'}
                </p>
                <p className="text-sm text-obsidian-400 mt-1 line-clamp-1">{upcomingPickup?.product?.name || 'Browse catalog to reserve your next look.'}</p>
              </div>
              <div className="card p-4">
                <p className="text-xs uppercase tracking-wider text-obsidian-400">Awaiting Pickup</p>
                <p className="font-display text-lg font-semibold mt-1">{unpaid.length} reservations</p>
                <p className="text-sm text-amber-600 mt-1">{formatCurrency(amountAtRisk)} reserved and unpaid</p>
              </div>
              <div className="card p-4">
                <p className="text-xs uppercase tracking-wider text-obsidian-400">Quick Actions</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Link href="/catalog" className="badge">Browse</Link>
                  <Link href="/location" className="badge">Pickup Location</Link>
                  <Link href="/dashboard" onClick={() => setTab('favorites')} className="badge">Wishlist</Link>
                </div>
              </div>
            </div>
            {/* Active */}
            <div>
              <h2 className="font-display text-xl font-semibold mb-4 flex items-center gap-2">
                <Bell className="w-5 h-5 text-gold-500" />
                Active Reservations ({active.length})
              </h2>
              {rentalsLoading ? (
                <div className="space-y-3">{[1,2].map(i => <div key={i} className="card p-4 h-24 skeleton" />)}</div>
              ) : active.length === 0 ? (
                <div className="card p-8 text-center text-obsidian-400">
                  <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p>No active reservations</p>
                  <Link href="/catalog" className="btn-primary mt-4 inline-flex">Browse Collection</Link>
                </div>
              ) : (
                <div className="space-y-3">{active.map((r) => <RentalCard key={r.id} rental={r} />)}</div>
              )}
            </div>
            {/* Past */}
            {past.length > 0 && (
              <div>
                <h2 className="font-display text-xl font-semibold mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-obsidian-400" />
                  Past Rentals ({past.length})
                </h2>
                <div className="space-y-3">{past.map((r) => <RentalCard key={r.id} rental={r} />)}</div>
              </div>
            )}
          </div>
        )}

        {tab === 'favorites' && (
          <div>
            <h2 className="font-display text-xl font-semibold mb-4">Saved Items</h2>
            {favLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[1,2,3].map(i => <div key={i} className="aspect-[3/4] skeleton rounded-2xl" />)}
              </div>
            ) : favorites.length === 0 ? (
              <div className="card p-8 text-center text-obsidian-400">
                <Heart className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>No saved items yet</p>
                <Link href="/catalog" className="btn-primary mt-4 inline-flex">Browse Collection</Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {favorites.map((f) => f.product && (
                  <Link key={f.id} href={`/product/${f.product.slug}`} className="card overflow-hidden group block">
                    <div className="aspect-[3/4] overflow-hidden">
                      <img src={f.product.images?.[0]} alt={f.product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="p-3">
                      <p className="text-xs text-obsidian-400 mb-0.5">{f.product.category}</p>
                      <p className="font-display text-sm font-semibold line-clamp-1">{f.product.name}</p>
                      <p className="text-gold-600 text-sm font-medium mt-1">{formatCurrency(f.product.pricePerDay)}/day</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'profile' && (
          <div className="max-w-md">
            <h2 className="font-display text-xl font-semibold mb-6">Profile Settings</h2>
            <div className="card p-6 space-y-4">
              <div>
                <label className="label">Full Name</label>
                <input className="input" defaultValue={session?.user?.name || ''} readOnly />
              </div>
              <div>
                <label className="label">Email</label>
                <input className="input" defaultValue={session?.user?.email || ''} readOnly />
              </div>
              <div>
                <label className="label">Role</label>
                <input className="input" defaultValue={(session?.user as any)?.role || 'USER'} readOnly />
              </div>
              <p className="text-xs text-obsidian-400 pt-2">Profile editing coming soon. Contact support to update your information.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
