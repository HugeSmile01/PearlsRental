import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { parseJsonField } from '@/lib/utils';
import { addHours } from 'date-fns';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as any).id;
  const role = (session.user as any).role;

  const where = role === 'ADMIN' ? {} : { userId };

  const rentals = await prisma.rental.findMany({
    where,
    include: {
      product: true,
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const parsed = rentals.map((r) => ({
    ...r,
    product: r.product
      ? {
          ...r.product,
          images: parseJsonField<string[]>(r.product.images),
          tags: parseJsonField<string[]>(r.product.tags),
        }
      : null,
  }));

  return NextResponse.json(parsed);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as any).id;
  const body = await request.json();
  const { productId, startDate, endDate, notes } = body;

  const start = new Date(startDate);
  const end = new Date(endDate);

  // Check availability
  const conflict = await prisma.rental.findFirst({
    where: {
      productId,
      status: { in: ['RESERVED_UNPAID', 'PICKED_UP_PAID'] },
      AND: [
        { startDate: { lte: end } },
        { endDate: { gte: start } },
      ],
    },
  });

  if (conflict) {
    return NextResponse.json({ error: 'Product is not available for selected dates' }, { status: 409 });
  }

  const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

  const totalPrice = product.pricePerDay * days;
  const expiryHours = parseInt(process.env.RESERVATION_EXPIRY_HOURS || '24');

  const rental = await prisma.rental.create({
    data: {
      userId,
      productId,
      startDate: start,
      endDate: end,
      status: 'RESERVED_UNPAID',
      notes,
      totalPrice,
      expiresAt: addHours(new Date(), expiryHours),
    },
    include: {
      product: true,
      user: { select: { id: true, name: true, email: true } },
    },
  });

  // Update product status
  await prisma.product.update({
    where: { id: productId },
    data: { status: 'RESERVED' },
  });

  return NextResponse.json({
    ...rental,
    product: rental.product
      ? {
          ...rental.product,
          images: parseJsonField<string[]>(rental.product.images),
          tags: parseJsonField<string[]>(rental.product.tags),
        }
      : null,
  });
}
