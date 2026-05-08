import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/authz';
import { handleApiError } from '@/lib/response';
import { scoreProduct } from '@/lib/recommendation';

export async function GET(request: NextRequest) {
  try {
    const session = await requireSession();
    const userId = (session.user as any).id as string;
    const limit = Math.min(24, Math.max(1, Number(new URL(request.url).searchParams.get('limit') || '8')));

    const [viewed, favorites, products] = await Promise.all([
      prisma.recentlyViewed.findMany({ where: { userId }, orderBy: { viewedAt: 'desc' }, take: 30, include: { product: true } }),
      prisma.favorite.findMany({ where: { userId }, include: { product: true } }),
      prisma.product.findMany({ where: { status: { in: ['AVAILABLE', 'RESERVED'] } }, take: 120, orderBy: { createdAt: 'desc' } }),
    ]);

    const preferredCategories = new Set<string>();
    const preferredColors = new Set<string>();
    const preferredOccasions = new Set<string>();

    for (const item of [...viewed, ...favorites]) {
      preferredCategories.add(item.product.category);
      preferredColors.add(item.product.color);
      preferredOccasions.add(item.product.occasion);
    }

    const scored = products
      .map((product) => ({
        product,
        score: scoreProduct(product, {
          recentlyViewedIds: viewed.map((v) => v.productId),
          preferredCategories: Array.from(preferredCategories),
          preferredColors: Array.from(preferredColors),
          preferredOccasions: Array.from(preferredOccasions),
        }),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((x) => x.product);

    return NextResponse.json(scored);
  } catch (error) {
    return handleApiError(error);
  }
}
