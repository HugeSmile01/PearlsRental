import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parseJsonField } from '@/lib/utils';
import { addHours } from 'date-fns';
import { requireSession, isAdminSession } from '@/lib/authz';
import { ApiError, handleApiError, parseJsonOrThrow } from '@/lib/response';
import { parseRentalCreate } from '@/lib/validation';
import { isRateLimited, rateLimitKey } from '@/lib/rate-limit';
export const dynamic = 'force-dynamic';
import { calculateRentalPrice, computeDemandFactor } from '@/lib/pricing';

export async function GET() {
  try {
    const session = await requireSession();
    const userId = (session.user as any).id;

    const where = isAdminSession(session) ? {} : { userId };

    const rentals = await prisma.rental.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            images: true,
            tags: true,
            status: true,
            pricePerDay: true,
            category: true,
            size: true,
            color: true,
          },
        },
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
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession();
    const userId = (session.user as any).id;

    const key = rateLimitKey(request.headers.get('x-forwarded-for'), 'rental-create', userId);
    if (isRateLimited(key, 20, 60_000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const body = parseRentalCreate(await parseJsonOrThrow(request));
    const start = new Date(body.startDate);
    const end = new Date(body.endDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
      throw new ApiError(400, 'Invalid reservation dates');
    }

    const expiryHours = parseInt(process.env.RESERVATION_EXPIRY_HOURS || '24', 10);

    const rental = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id: body.productId }, select: { id: true, pricePerDay: true, category: true } });
      if (!product) throw new ApiError(404, 'Product not found');

      const conflict = await tx.rental.findFirst({
        where: {
          productId: body.productId,
          status: { in: ['RESERVED_UNPAID', 'PICKED_UP_PAID', 'OVERDUE'] },
          startDate: { lte: end },
          endDate: { gte: start },
        },
      });

      if (conflict) throw new ApiError(409, 'Product is not available for selected dates');

      const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
      const [activeCategoryRentals, totalCategoryInventory] = await Promise.all([
        tx.rental.count({
          where: {
            status: { in: ['RESERVED_UNPAID', 'PICKED_UP_PAID', 'OVERDUE'] },
            product: { category: product.category },
          },
        }),
        tx.product.count({ where: { category: product.category } }),
      ]);

      const demandFactor = computeDemandFactor(activeCategoryRentals, totalCategoryInventory);
      const pricing = calculateRentalPrice({
        baseDailyPrice: product.pricePerDay,
        rentalDays: days,
        demandFactor,
      });

      const createdRental = await tx.rental.create({
        data: {
          userId,
          productId: body.productId,
          startDate: start,
          endDate: end,
          status: 'RESERVED_UNPAID',
          notes: body.notes,
          totalPrice: pricing.total,
          expiresAt: addHours(new Date(), expiryHours),
        },
        include: {
          product: true,
          user: { select: { id: true, name: true, email: true } },
        },
      });

      await tx.product.update({
        where: { id: body.productId },
        data: { status: 'RESERVED' },
      });

      return createdRental;
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
  } catch (error) {
    return handleApiError(error);
  }
}
