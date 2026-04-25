import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { parseJsonField } from '@/lib/utils';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { status } = body;

  const rental = await prisma.rental.findUnique({ where: { id: params.id } });
  if (!rental) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const updated = await prisma.rental.update({
    where: { id: params.id },
    data: { status },
    include: { product: true, user: { select: { id: true, name: true, email: true } } },
  });

  // Sync product status
  let productStatus: string;
  if (status === 'PICKED_UP_PAID') productStatus = 'RENTED';
  else if (status === 'RETURNED' || status === 'CANCELLED' || status === 'EXPIRED') productStatus = 'AVAILABLE';
  else productStatus = 'RESERVED';

  await prisma.product.update({ where: { id: rental.productId }, data: { status: productStatus as any } });

  return NextResponse.json({
    ...updated,
    product: updated.product
      ? { ...updated.product, images: parseJsonField<string[]>(updated.product.images), tags: parseJsonField<string[]>(updated.product.tags) }
      : null,
  });
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rental = await prisma.rental.findUnique({ where: { id: params.id } });
  if (!rental) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.rental.update({ where: { id: params.id }, data: { status: 'CANCELLED' } });
  await prisma.product.update({ where: { id: rental.productId }, data: { status: 'AVAILABLE' } });

  return NextResponse.json({ success: true });
}
