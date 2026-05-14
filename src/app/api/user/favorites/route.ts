import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parseJsonField } from '@/lib/utils';
import { requireAdmin, requireSession } from '@/lib/authz';
export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await requireSession();
    const userId = session.user.id;

  const favorites = await prisma.favorite.findMany({
    where: { userId },
    include: { product: true },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(
    favorites.map((f) => ({
      ...f,
      product: f.product
        ? { ...f.product, images: parseJsonField<string[]>(f.product.images), tags: parseJsonField<string[]>(f.product.tags) }
        : null,
    }))
  );
}

export async function POST(request: NextRequest) {
  const session = await requireSession();
    const userId = session.user.id;
  const { productId } = await request.json();

  const existing = await prisma.favorite.findUnique({ where: { userId_productId: { userId, productId } } });
  if (existing) {
    await prisma.favorite.delete({ where: { userId_productId: { userId, productId } } });
    return NextResponse.json({ favorited: false });
  }

  await prisma.favorite.create({ data: { userId, productId } });
  return NextResponse.json({ favorited: true });
}
