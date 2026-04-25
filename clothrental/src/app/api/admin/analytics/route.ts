import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { parseJsonField } from '@/lib/utils';

export async function GET() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const [totalRentals, activeRentals, totalRevenue, products, recentRentals] = await Promise.all([
    prisma.rental.count(),
    prisma.rental.count({ where: { status: { in: ['RESERVED_UNPAID', 'PICKED_UP_PAID'] } } }),
    prisma.rental.aggregate({ where: { status: 'PICKED_UP_PAID' }, _sum: { totalPrice: true } }),
    prisma.product.findMany(),
    prisma.rental.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { product: true, user: { select: { name: true, email: true } } },
    }),
  ]);

  // Most rented products
  const rentalCounts = await prisma.rental.groupBy({
    by: ['productId'],
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 5,
  });

  const topProductIds = rentalCounts.map((r) => r.productId);
  const topProducts = await prisma.product.findMany({ where: { id: { in: topProductIds } } });

  const mostRented = rentalCounts.map((rc) => {
    const product = topProducts.find((p) => p.id === rc.productId);
    return {
      product: product
        ? { ...product, images: parseJsonField<string[]>(product.images), tags: parseJsonField<string[]>(product.tags) }
        : null,
      count: rc._count.id,
    };
  });

  const inventoryByStatus = await prisma.product.groupBy({ by: ['status'], _count: { id: true } });

  return NextResponse.json({
    totalRentals,
    activeRentals,
    totalRevenue: totalRevenue._sum.totalPrice || 0,
    totalProducts: products.length,
    mostRented,
    inventoryByStatus,
    recentRentals: recentRentals.map((r) => ({
      ...r,
      product: r.product
        ? { ...r.product, images: parseJsonField<string[]>(r.product.images), tags: parseJsonField<string[]>(r.product.tags) }
        : null,
    })),
  });
}
