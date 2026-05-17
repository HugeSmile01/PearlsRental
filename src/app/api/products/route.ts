export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/response';
import { listProducts } from '@/lib/products';

const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 50;
const DEFAULT_MAX_PRICE = 99999;
const VALID_SORTS = new Set(['newest', 'price_asc', 'price_desc']);

const toPositiveFloat = (value: string | null, fallback: number) => {
  const parsed = Number.parseFloat(value ?? '');
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
};

const toPositiveInt = (value: string | null, fallback: number, max: number) => {
  const parsed = Number.parseInt(value ?? '', 10);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, max);
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = (searchParams.get('search') || '').trim();
    const category = (searchParams.get('category') || '').trim();
    const size = (searchParams.get('size') || '').trim();
    const status = (searchParams.get('status') || '').trim();
    const minPrice = toPositiveFloat(searchParams.get('minPrice'), 0);
    const maxPriceCandidate = toPositiveFloat(searchParams.get('maxPrice'), DEFAULT_MAX_PRICE);
    const maxPrice = Math.max(minPrice, maxPriceCandidate);
    const sortByParam = (searchParams.get('sortBy') || 'newest').trim();
    const sortBy = VALID_SORTS.has(sortByParam) ? sortByParam : 'newest';
    const featured = searchParams.get('featured') === 'true';
    const limit = toPositiveInt(searchParams.get('limit'), DEFAULT_LIMIT, MAX_LIMIT);

    const result = await listProducts({
      search,
      category,
      size,
      status,
      minPrice,
      maxPrice,
      sortBy: sortBy as 'newest' | 'price_asc' | 'price_desc',
      featured,
      limit,
    });

    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 500 });
    return NextResponse.json(result.data);
  } catch (error) {
    return handleApiError(error);
  }
}
