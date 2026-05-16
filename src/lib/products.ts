import type { Product } from '@/types';

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  size: string;
  color: string | null;
  fabric: string | null;
  occasion: string | null;
  image_urls: string[] | null;
  tags: string[] | null;
  price_per_day: number | string;
  status: string;
  created_at: string;
  updated_at: string;
};

type ProductFilters = {
  search?: string;
  category?: string;
  size?: string;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'newest' | 'price_asc' | 'price_desc';
  featured?: boolean;
  limit?: number;
};

type ProductUpdateInput = {
  name: string;
  description: string;
  category: string;
  size: string;
  color: string;
  fabric: string;
  occasion: string;
  images: string[];
  pricePerDay: number;
  tags: string[];
  status?: string;
};

const PRODUCT_SELECT =
  'id,name,slug,description,category,size,color,fabric,occasion,image_urls,tags,price_per_day,status,created_at,updated_at';

function getDbConfig() {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const apiKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!baseUrl || !apiKey) return null;
  return { baseUrl, apiKey };
}

function toProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    category: row.category,
    size: row.size,
    color: row.color || '',
    fabric: row.fabric || '',
    occasion: row.occasion || '',
    images: Array.isArray(row.image_urls) ? row.image_urls : [],
    pricePerDay: typeof row.price_per_day === 'string' ? Number.parseFloat(row.price_per_day) : row.price_per_day,
    status: row.status as Product['status'],
    tags: Array.isArray(row.tags) ? row.tags : [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function supabaseProductsRequest(pathWithQuery: string, init?: RequestInit) {
  const config = getDbConfig();
  if (!config) return { ok: false as const, error: 'Supabase product data is not configured' };

  try {
    const response = await fetch(`${config.baseUrl}/rest/v1/products${pathWithQuery}`, {
      ...init,
      headers: {
        apikey: config.apiKey,
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
        ...(init?.headers || {}),
      },
      cache: 'no-store',
    });

    const body = await response.json().catch(() => null);
    if (!response.ok) {
      const message = (body && (body.message || body.error || body.hint)) || 'Supabase request failed';
      return { ok: false as const, error: String(message) };
    }

    return { ok: true as const, data: body };
  } catch {
    return { ok: false as const, error: 'Unable to connect to Supabase products API' };
  }
}

export async function listProducts(filters: ProductFilters = {}) {
  const params = new URLSearchParams();
  params.set('select', PRODUCT_SELECT);
  params.set('limit', String(filters.featured ? 6 : Math.min(filters.limit ?? 50, 100)));

  if (filters.category) params.set('category', `eq.${filters.category}`);
  if (filters.size) params.set('size', `eq.${filters.size}`);
  if (filters.status) params.set('status', `eq.${filters.status}`);

  if (typeof filters.minPrice === 'number' && Number.isFinite(filters.minPrice)) {
    params.append('price_per_day', `gte.${filters.minPrice}`);
  }
  if (typeof filters.maxPrice === 'number' && Number.isFinite(filters.maxPrice)) {
    params.append('price_per_day', `lte.${filters.maxPrice}`);
  }

  if (filters.search) {
    const term = filters.search.replace(/[%_]/g, '').trim();
    if (term) {
      params.set('or', `(name.ilike.*${term}*,description.ilike.*${term}*,category.ilike.*${term}*)`);
    }
  }

  const sortBy = filters.sortBy || 'newest';
  if (sortBy === 'price_asc') params.set('order', 'price_per_day.asc');
  else if (sortBy === 'price_desc') params.set('order', 'price_per_day.desc');
  else params.set('order', 'created_at.desc');

  const result = await supabaseProductsRequest(`?${params.toString()}`);
  if (!result.ok) return result;
  const rows = Array.isArray(result.data) ? (result.data as ProductRow[]) : [];
  return { ok: true as const, data: rows.map(toProduct) };
}

export async function getProductBySlug(slug: string) {
  const params = new URLSearchParams();
  params.set('select', PRODUCT_SELECT);
  params.set('slug', `eq.${slug}`);
  params.set('limit', '1');
  const result = await supabaseProductsRequest(`?${params.toString()}`);
  if (!result.ok) return result;
  const rows = Array.isArray(result.data) ? (result.data as ProductRow[]) : [];
  if (!rows.length) return { ok: true as const, data: null };
  return { ok: true as const, data: toProduct(rows[0]) };
}

export async function getRelatedProducts(category: string, excludeId: string, limit = 4) {
  const params = new URLSearchParams();
  params.set('select', PRODUCT_SELECT);
  params.set('category', `eq.${category}`);
  params.set('id', `neq.${excludeId}`);
  params.set('order', 'created_at.desc');
  params.set('limit', String(Math.max(1, Math.min(limit, 20))));

  const result = await supabaseProductsRequest(`?${params.toString()}`);
  if (!result.ok) return result;
  const rows = Array.isArray(result.data) ? (result.data as ProductRow[]) : [];
  return { ok: true as const, data: rows.map(toProduct) };
}

export async function updateProductBySlug(slug: string, input: ProductUpdateInput) {
  const payload = {
    name: input.name,
    description: input.description,
    category: input.category,
    size: input.size,
    color: input.color,
    fabric: input.fabric,
    occasion: input.occasion,
    image_urls: input.images,
    price_per_day: input.pricePerDay,
    tags: input.tags,
    ...(input.status ? { status: input.status } : {}),
  };

  const params = new URLSearchParams();
  params.set('slug', `eq.${slug}`);
  params.set('select', PRODUCT_SELECT);
  const result = await supabaseProductsRequest(`?${params.toString()}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
    headers: { Prefer: 'return=representation' },
  });
  if (!result.ok) return result;
  const rows = Array.isArray(result.data) ? (result.data as ProductRow[]) : [];
  if (!rows.length) return { ok: true as const, data: null };
  return { ok: true as const, data: toProduct(rows[0]) };
}
