import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/authz';
import { handleApiError, parseJsonOrThrow } from '@/lib/response';
import { parseProductWrite } from '@/lib/validation';
import { getProductBySlug, updateProductBySlug } from '@/lib/products';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  const result = await getProductBySlug(params.slug);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 500 });

  if (!result.data) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  return NextResponse.json(result.data);
}

export async function PUT(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    await requireAdmin();
    const body = parseProductWrite(await parseJsonOrThrow(request));

    const result = await updateProductBySlug(params.slug, body);
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 500 });
    if (!result.data) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    return NextResponse.json(result.data);
  } catch (error) {
    return handleApiError(error);
  }
}
