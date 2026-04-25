import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('productId');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  if (!productId || !startDate || !endDate) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400 });
  }

  const conflict = await prisma.rental.findFirst({
    where: {
      productId,
      status: { in: ['RESERVED_UNPAID', 'PICKED_UP_PAID'] },
      AND: [
        { startDate: { lte: new Date(endDate) } },
        { endDate: { gte: new Date(startDate) } },
      ],
    },
  });

  return NextResponse.json({ available: !conflict });
}
