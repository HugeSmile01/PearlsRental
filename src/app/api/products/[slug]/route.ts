import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parseJsonField } from '@/lib/utils';

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
  });

  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  return NextResponse.json({
    ...product,
    images: parseJsonField<string[]>(product.images),
    tags: parseJsonField<string[]>(product.tags),
  });
}

export async function PUT(request: NextRequest, { params }: { params: { slug: string } }) {
  const body = await request.json();

  const product = await prisma.product.update({
    where: { slug: params.slug },
    data: {
      ...body,
      images: JSON.stringify(body.images),
      tags: JSON.stringify(body.tags),
    },
  });

  return NextResponse.json({
    ...product,
    images: parseJsonField<string[]>(product.images),
    tags: parseJsonField<string[]>(product.tags),
  });
}
