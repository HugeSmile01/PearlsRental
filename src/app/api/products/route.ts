export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { handleApiError } from '@/lib/response';
import { parseJsonField } from '@/lib/utils';

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

    const where = {
      AND: [
        search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' as const } },
                { description: { contains: search, mode: 'insensitive' as const } },
                { tags: { contains: search, mode: 'insensitive' as const } },
                { category: { contains: search, mode: 'insensitive' as const } },
              ],
            }
          : {},
        category ? { category } : {},
        size ? { size } : {},
        status ? { status } : {},
        { pricePerDay: { gte: minPrice, lte: maxPrice } },
      ],
    };

    const orderBy =
      sortBy === 'price_asc'
        ? { pricePerDay: 'asc' as const }
        : sortBy === 'price_desc'
          ? { pricePerDay: 'desc' as const }
          : { createdAt: 'desc' as const };

    const products = await prisma.product.findMany({
      where,
      orderBy,
      take: featured ? 6 : limit,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        category: true,
        size: true,
        color: true,
        fabric: true,
        occasion: true,
        images: true,
        pricePerDay: true,
        status: true,
        tags: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const parsed = products.map((p) => ({
      ...p,
      images: parseJsonField<string[]>(p.images),
      tags: parseJsonField<string[]>(p.tags),
    }));

    return NextResponse.json(parsed);
  } catch (error) {
    return handleApiError(error);
  }
}
