'use client';
import { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = ['Gowns', 'Suits', 'Dresses', 'Blazers', 'Traditional', 'Accessories'];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size'];

interface Props {
  product?: any;
  onClose: () => void;
  onSave: () => void;
}

export function AdminProductModal({ product, onClose, onSave }: Props) {
  const isEdit = !!product;
  const [form, setForm] = useState({
    name: product?.name || '',
    description: product?.description || '',
    category: product?.category || 'Gowns',
    size: product?.size || 'M',
    color: product?.color || '',
    fabric: product?.fabric || '',
    occasion: product?.occasion || '',
    pricePerDay: product?.pricePerDay || '',
    status: product?.status || 'AVAILABLE',
    images: product?.images || [''],
    tags: product?.tags?.join(', ') || '',
  });
  const [saving, setSaving] = useState(false);

  const update = (key: string, val: any) => setForm((f) => ({ ...f, [key]: val }));

  const updateImage = (i: number, val: string) => {
    const imgs = [...form.images];
    imgs[i] = val;
    setForm((f) => ({ ...f, images: imgs }));
  };

  const addImage = () => setForm((f) => ({ ...f, images: [...f.images, ''] }));
  const removeImage = (i: number) => setForm((f) => ({ ...f, images: f.images.filter((_: any, idx: number) => idx !== i) }));

  const handleSave = async () => {
    if (!form.name || !form.pricePerDay) { toast.error('Name and price are required'); return; }
    setSaving(true);
    const payload = {
      ...form,
      pricePerDay: parseFloat(String(form.pricePerDay)),
      images: form.images.filter(Boolean),
      tags: form.tags.split(',').map((t: string) => t.trim()).filter(Boolean),
    };

    try {
      let res;
      if (isEdit) {
        res = await fetch(`/api/products/${product.slug}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/admin/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
      if (!res.ok) throw new Error('Failed');
      toast.success(isEdit ? 'Product updated' : 'Product created');
      onSave();
    } catch {
      toast.error('Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-obsidian-900/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-obsidian-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in">
        <div className="sticky top-0 bg-white dark:bg-obsidian-900 border-b border-obsidian-100 dark:border-obsidian-800 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="font-display text-xl font-semibold">{isEdit ? 'Edit Product' : 'Add New Product'}</h2>
          <button onClick={onClose} className="btn-ghost p-2"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-6 space-y-5">
          {/* Name */}
          <div>
            <label className="label">Product Name *</label>
            <input className="input" value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="e.g. Ivory Silk Evening Gown" />
          </div>

          {/* Description */}
          <div>
            <label className="label">Description</label>
            <textarea className="input resize-none" rows={3} value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="Detailed description of the item..." />
          </div>

          {/* Grid fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Category *</label>
              <select className="input" value={form.category} onChange={(e) => update('category', e.target.value)}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Size *</label>
              <select className="input" value={form.size} onChange={(e) => update('size', e.target.value)}>
                {SIZES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Color</label>
              <input className="input" value={form.color} onChange={(e) => update('color', e.target.value)} placeholder="e.g. Ivory White" />
            </div>
            <div>
              <label className="label">Fabric</label>
              <input className="input" value={form.fabric} onChange={(e) => update('fabric', e.target.value)} placeholder="e.g. Pure Silk" />
            </div>
            <div>
              <label className="label">Occasion</label>
              <input className="input" value={form.occasion} onChange={(e) => update('occasion', e.target.value)} placeholder="e.g. Gala, Wedding" />
            </div>
            <div>
              <label className="label">Price Per Day (₱) *</label>
              <input className="input" type="number" value={form.pricePerDay} onChange={(e) => update('pricePerDay', e.target.value)} placeholder="1500" />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="label">Status</label>
            <select className="input" value={form.status} onChange={(e) => update('status', e.target.value)}>
              {['AVAILABLE', 'RESERVED', 'RENTED', 'MAINTENANCE'].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Images */}
          <div>
            <label className="label">Image URLs</label>
            <div className="space-y-2">
              {form.images.map((img: string, i: number) => (
                <div key={i} className="flex gap-2">
                  <input
                    className="input flex-1"
                    value={img}
                    onChange={(e) => updateImage(i, e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                  />
                  {form.images.length > 1 && (
                    <button onClick={() => removeImage(i)} className="btn-ghost p-2 text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button onClick={addImage} className="btn-ghost text-sm text-gold-600">
                <Plus className="w-4 h-4" />
                Add Image URL
              </button>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="label">Tags (comma separated)</label>
            <input className="input" value={form.tags} onChange={(e) => update('tags', e.target.value)} placeholder="gown, silk, wedding, formal" />
          </div>
        </div>

        <div className="sticky bottom-0 bg-white dark:bg-obsidian-900 border-t border-obsidian-100 dark:border-obsidian-800 px-6 py-4 flex gap-3 rounded-b-2xl">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
            {saving ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </div>
    </div>
  );
}
