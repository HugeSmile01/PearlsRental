'use client';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { redirect } from 'next/navigation';
import {
  LayoutDashboard, Package, ShoppingBag, TrendingUp,
  Plus, Edit2, Trash2, CheckCircle, XCircle, MoreVertical
} from 'lucide-react';
import { cn, formatCurrency, formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';
import type { Rental } from '@/types';
import toast from 'react-hot-toast';
import { AdminProductModal } from '@/components/admin/AdminProductModal';

type Tab = 'overview' | 'rentals' | 'inventory';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [tab, setTab] = useState<Tab>('overview');
  const [productModal, setProductModal] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);
  const qc = useQueryClient();

  if (status === 'loading') return null;
  if (status === 'unauthenticated' || (session?.user as any)?.role !== 'ADMIN') redirect('/');

  const { data: analytics } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => fetch('/api/admin/analytics').then((r) => r.json()),
  });

  const { data: rentals = [], isLoading: rentalsLoading } = useQuery<Rental[]>({
    queryKey: ['admin-rentals'],
    queryFn: () => fetch('/api/rentals').then((r) => r.json()),
    enabled: tab === 'rentals' || tab === 'overview',
  });

  const { data: products = [], isLoading: productsLoading } = useQuery<any[]>({
    queryKey: ['admin-products'],
    queryFn: () => fetch('/api/products').then((r) => r.json()),
    enabled: tab === 'inventory' || tab === 'overview',
  });

  const updateRental = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      fetch(`/api/rentals/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }).then((r) => r.json()),
    onSuccess: () => { toast.success('Status updated'); qc.invalidateQueries({ queryKey: ['admin-rentals'] }); qc.invalidateQueries({ queryKey: ['admin-analytics'] }); },
  });

  const deleteProduct = useMutation({
    mutationFn: (id: string) => fetch(`/api/admin/products?id=${id}`, { method: 'DELETE' }).then((r) => r.json()),
    onSuccess: () => { toast.success('Product deleted'); qc.invalidateQueries({ queryKey: ['admin-products'] }); },
  });

  const tabs = [
    { id: 'overview' as Tab, label: 'Overview', icon: LayoutDashboard },
    { id: 'rentals' as Tab, label: 'Rentals', icon: ShoppingBag },
    { id: 'inventory' as Tab, label: 'Inventory', icon: Package },
  ];

  const RENTAL_STATUSES = ['RESERVED_UNPAID', 'PICKED_UP_PAID', 'RETURNED', 'OVERDUE', 'CANCELLED'];

  return (
    <div className="pt-16 min-h-screen">
      {/* Header */}
      <div className="bg-obsidian-900 dark:bg-obsidian-950 pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gold-400 text-xs uppercase tracking-widest mb-1">Admin Panel</p>
              <h1 className="font-display text-2xl font-semibold text-white">Dashboard</h1>
            </div>
            <button onClick={() => { setEditProduct(null); setProductModal(true); }} className="btn-primary text-sm">
              <Plus className="w-4 h-4" />
              Add Product
            </button>
          </div>

          {/* Stat cards */}
          {analytics && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
              {[
                { label: 'Total Rentals', value: analytics.totalRentals, icon: ShoppingBag },
                { label: 'Active Rentals', value: analytics.activeRentals, icon: TrendingUp },
                { label: 'Revenue (Paid)', value: formatCurrency(analytics.totalRevenue), icon: CheckCircle },
                { label: 'Products', value: analytics.totalProducts, icon: Package },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="bg-obsidian-800/60 rounded-xl p-4">
                  <Icon className="w-5 h-5 text-gold-400 mb-2" />
                  <p className="font-display text-2xl font-semibold text-white">{value}</p>
                  <p className="text-obsidian-400 text-xs mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-1 bg-obsidian-100 dark:bg-obsidian-800 rounded-xl p-1 mb-8 w-fit">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={cn('flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                tab === id ? 'bg-white dark:bg-obsidian-900 shadow-sm text-obsidian-900 dark:text-white' : 'text-obsidian-500 hover:text-obsidian-700')}>
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent rentals */}
              <div className="card p-5">
                <h2 className="font-display text-lg font-semibold mb-4">Recent Rentals</h2>
                <div className="space-y-3">
                  {rentals.slice(0, 5).map((r) => (
                    <div key={r.id} className="flex items-center gap-3 py-2 border-b border-obsidian-100 dark:border-obsidian-800 last:border-0">
                      {r.product?.images?.[0] && <img src={r.product.images[0]} alt="" className="w-10 h-12 object-cover rounded-lg shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{r.product?.name}</p>
                        <p className="text-xs text-obsidian-400">{(r as any).user?.name} · {formatDate(r.createdAt)}</p>
                      </div>
                      <span className={cn('badge text-xs', getStatusColor(r.status))}>{getStatusLabel(r.status)}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Most rented */}
              <div className="card p-5">
                <h2 className="font-display text-lg font-semibold mb-4">Most Rented</h2>
                <div className="space-y-3">
                  {analytics?.mostRented?.map(({ product, count }: any, i: number) => (
                    product && (
                      <div key={product.id} className="flex items-center gap-3">
                        <span className="text-obsidian-300 dark:text-obsidian-600 font-mono text-sm w-5">{i + 1}</span>
                        {product.images?.[0] && <img src={product.images[0]} alt="" className="w-10 h-12 object-cover rounded-lg shrink-0" />}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{product.name}</p>
                          <p className="text-xs text-obsidian-400">{product.category}</p>
                        </div>
                        <span className="text-sm font-semibold text-gold-600">{count}×</span>
                      </div>
                    )
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rentals tab */}
        {tab === 'rentals' && (
          <div>
            <h2 className="font-display text-xl font-semibold mb-5">All Rentals</h2>
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-obsidian-50 dark:bg-obsidian-800 border-b border-obsidian-100 dark:border-obsidian-700">
                    <tr>
                      {['Item', 'Customer', 'Dates', 'Total', 'Status', 'Actions'].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-medium text-obsidian-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-obsidian-100 dark:divide-obsidian-800">
                    {rentals.map((r) => (
                      <tr key={r.id} className="hover:bg-obsidian-50 dark:hover:bg-obsidian-800/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {r.product?.images?.[0] && <img src={r.product.images[0]} alt="" className="w-8 h-10 object-cover rounded shrink-0" />}
                            <span className="font-medium truncate max-w-[140px]">{r.product?.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-obsidian-500">{(r as any).user?.name}</td>
                        <td className="px-4 py-3 text-obsidian-500 whitespace-nowrap">
                          {formatDate(r.startDate)} – {formatDate(r.endDate)}
                        </td>
                        <td className="px-4 py-3 font-semibold text-gold-600">{formatCurrency(r.totalPrice)}</td>
                        <td className="px-4 py-3">
                          <span className={cn('badge text-xs', getStatusColor(r.status))}>{getStatusLabel(r.status)}</span>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            defaultValue={r.status}
                            onChange={(e) => updateRental.mutate({ id: r.id, status: e.target.value })}
                            className="text-xs border border-obsidian-200 dark:border-obsidian-700 rounded-lg px-2 py-1.5 bg-white dark:bg-obsidian-800 focus:outline-none focus:border-gold-500"
                          >
                            {RENTAL_STATUSES.map((s) => <option key={s} value={s}>{getStatusLabel(s)}</option>)}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Inventory tab */}
        {tab === 'inventory' && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl font-semibold">Inventory ({products.length})</h2>
              <button onClick={() => { setEditProduct(null); setProductModal(true); }} className="btn-primary text-sm">
                <Plus className="w-4 h-4" />
                Add Product
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map((p) => (
                <div key={p.id} className="card overflow-hidden group">
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <img src={p.images?.[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-2 left-2">
                      <span className={cn('badge text-xs', getStatusColor(p.status))}>{getStatusLabel(p.status)}</span>
                    </div>
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditProduct(p); setProductModal(true); }}
                        className="w-7 h-7 bg-white dark:bg-obsidian-900 rounded-full flex items-center justify-center shadow hover:bg-gold-50 transition-colors">
                        <Edit2 className="w-3.5 h-3.5 text-gold-600" />
                      </button>
                      <button onClick={() => { if (confirm('Delete this product?')) deleteProduct.mutate(p.id); }}
                        className="w-7 h-7 bg-white dark:bg-obsidian-900 rounded-full flex items-center justify-center shadow hover:bg-red-50 transition-colors">
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                      </button>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="font-display text-sm font-semibold truncate">{p.name}</p>
                    <p className="text-xs text-obsidian-400 mt-0.5">{p.category} · {p.size}</p>
                    <p className="text-gold-600 text-sm font-semibold mt-1">{formatCurrency(p.pricePerDay)}/day</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Product modal */}
      {productModal && (
        <AdminProductModal
          product={editProduct}
          onClose={() => setProductModal(false)}
          onSave={() => { setProductModal(false); qc.invalidateQueries({ queryKey: ['admin-products'] }); }}
        />
      )}
    </div>
  );
}
