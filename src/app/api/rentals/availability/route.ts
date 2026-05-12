import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('productId');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  if (!productId || !startDate || !endDate) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400 });
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
    return NextResponse.json({ error: 'Invalid date range' }, { status: 400 });
  }

  const conflict = await prisma.rental.findFirst({
    where: {
      productId,
      status: { in: ['RESERVED_UNPAID', 'PICKED_UP_PAID', 'OVERDUE'] },
      startDate: { lte: end },
      endDate: { gte: start },
    },
  });

  return NextResponse.json({ available: !conflict });
}
