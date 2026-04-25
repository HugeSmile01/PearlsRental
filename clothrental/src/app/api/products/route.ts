import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parseJsonField } from '@/lib/utils';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const size = searchParams.get('size') || '';
  const status = searchParams.get('status') || '';
  const minPrice = parseFloat(searchParams.get('minPrice') || '0');
  const maxPrice = parseFloat(searchParams.get('maxPrice') || '99999');
  const sortBy = searchParams.get('sortBy') || 'newest';
  const featured = searchParams.get('featured') === 'true';
  const limit = parseInt(searchParams.get('limit') || '50');

  const where: any = {
    AND: [
      search
        ? {
            OR: [
              { name: { contains: search } },
              { description: { contains: search } },
              { tags: { contains: search } },
              { category: { contains: search } },
            ],
          }
        : {},
      category ? { category } : {},
      size ? { size } : {},
      status ? { status } : {},
      { pricePerDay: { gte: minPrice, lte: maxPrice } },
    ],
  };

  const orderBy: any =
    sortBy === 'price_asc'
      ? { pricePerDay: 'asc' }
      : sortBy === 'price_desc'
      ? { pricePerDay: 'desc' }
      : { createdAt: 'desc' };

  const products = await prisma.product.findMany({
    where,
    orderBy,
    take: featured ? 6 : limit,
  });

  const parsed = products.map((p) => ({
    ...p,
    images: parseJsonField<string[]>(p.images),
    tags: parseJsonField<string[]>(p.tags),
  }));

  return NextResponse.json(parsed);
}
