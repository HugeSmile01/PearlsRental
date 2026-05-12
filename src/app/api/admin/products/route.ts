import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parseJsonField } from '@/lib/utils';
import slugify from 'slugify';
import { requireAdmin } from '@/lib/authz';
import { ApiError, handleApiError, parseJsonOrThrow } from '@/lib/response';
import { isRateLimited, rateLimitKey } from '@/lib/rate-limit';
import { parseProductWrite } from '@/lib/validation';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin();
    const key = rateLimitKey(request.headers.get('x-forwarded-for'), 'admin-product-create', (session.user as any).id);
    if (isRateLimited(key, 30, 60_000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const body = parseProductWrite(await parseJsonOrThrow(request));
    const slug = `${slugify(body.name, { lower: true, strict: true })}-${Date.now()}`;

    const product = await prisma.product.create({
      data: {
        ...body,
        slug,
        images: JSON.stringify(body.images),
        tags: JSON.stringify(body.tags),
      },
    });

    return NextResponse.json({
      ...product,
      images: parseJsonField<string[]>(product.images),
      tags: parseJsonField<string[]>(product.tags),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await requireAdmin();
    const key = rateLimitKey(request.headers.get('x-forwarded-for'), 'admin-product-delete', (session.user as any).id);
    if (isRateLimited(key, 30, 60_000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) throw new ApiError(400, 'Missing id');

    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
