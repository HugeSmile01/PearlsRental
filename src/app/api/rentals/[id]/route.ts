import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parseJsonField } from '@/lib/utils';
import { requireSession, isAdminSession } from '@/lib/authz';
import { ApiError, handleApiError, parseJsonOrThrow } from '@/lib/response';
import { parseRentalUpdate } from '@/lib/validation';
import { canTransitionRentalStatus, deriveProductStatusFromRental } from '@/lib/rental-state';
import { isRateLimited, rateLimitKey } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireSession();
    const userId = (session.user as any).id;
    const admin = isAdminSession(session);

    const key = rateLimitKey(request.headers.get('x-forwarded-for'), 'rental-update', userId);
    if (isRateLimited(key, 40, 60_000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const { status } = parseRentalUpdate(await parseJsonOrThrow(request));

    const rental = await prisma.rental.findUnique({ where: { id: params.id } });
    if (!rental) throw new ApiError(404, 'Not found');

    if (!admin && rental.userId !== userId) throw new ApiError(403, 'Forbidden');
    if (!canTransitionRentalStatus(rental.status, status)) {
      throw new ApiError(409, `Invalid status transition: ${rental.status} -> ${status}`);
    }

    const updated = await prisma.$transaction(async (tx) => {
      const next = await tx.rental.update({
        where: { id: params.id },
        data: { status },
        include: {
          product: true,
          user: { select: { id: true, name: true, email: true } },
        },
      });

      await tx.product.update({
        where: { id: rental.productId },
        data: { status: deriveProductStatusFromRental(status) },
      });

      return next;
    });

    return NextResponse.json({
      ...updated,
      product: updated.product
        ? { ...updated.product, images: parseJsonField<string[]>(updated.product.images), tags: parseJsonField<string[]>(updated.product.tags) }
        : null,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireSession();
    const userId = (session.user as any).id;
    const admin = isAdminSession(session);

    const key = rateLimitKey(request.headers.get('x-forwarded-for'), 'rental-delete', userId);
    if (isRateLimited(key, 30, 60_000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const rental = await prisma.rental.findUnique({ where: { id: params.id } });
    if (!rental) throw new ApiError(404, 'Not found');

    if (!admin && rental.userId !== userId) throw new ApiError(403, 'Forbidden');
    if (!canTransitionRentalStatus(rental.status, 'CANCELLED')) {
      throw new ApiError(409, `Invalid status transition: ${rental.status} -> CANCELLED`);
    }

    await prisma.$transaction(async (tx) => {
      await tx.rental.update({ where: { id: params.id }, data: { status: 'CANCELLED' } });
      await tx.product.update({ where: { id: rental.productId }, data: { status: 'AVAILABLE' } });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
