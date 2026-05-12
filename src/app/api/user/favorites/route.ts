import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { parseJsonField } from '@/lib/utils';
export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session.user as any).id;

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
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session.user as any).id;
  const { productId } = await request.json();

  const existing = await prisma.favorite.findUnique({ where: { userId_productId: { userId, productId } } });
  if (existing) {
    await prisma.favorite.delete({ where: { userId_productId: { userId, productId } } });
    return NextResponse.json({ favorited: false });
  }

  await prisma.favorite.create({ data: { userId, productId } });
  return NextResponse.json({ favorited: true });
}
