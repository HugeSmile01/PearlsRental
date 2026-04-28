import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parseJsonField } from '@/lib/utils';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const size = searchParams.get('size') || '';
  const status = searchParams.get('status') || '';
  const minPrice = Number.parseFloat(searchParams.get('minPrice') || '0');
  const maxPrice = Number.parseFloat(searchParams.get('maxPrice') || '99999');
  const sortBy = searchParams.get('sortBy') || 'newest';
  const featured = searchParams.get('featured') === 'true';
  const limit = Math.min(Number.parseInt(searchParams.get('limit') || '50', 10), 100);

  const where: any = {
    AND: [
      search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
              { tags: { contains: search, mode: 'insensitive' } },
              { category: { contains: search, mode: 'insensitive' } },
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
}
