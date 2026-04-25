import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { parseJsonField } from '@/lib/utils';
import slugify from 'slugify';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const slug = slugify(body.name, { lower: true, strict: true }) + '-' + Date.now();

  const product = await prisma.product.create({
    data: {
      ...body,
      slug,
      images: JSON.stringify(body.images || []),
      tags: JSON.stringify(body.tags || []),
    },
  });

  return NextResponse.json({
    ...product,
    images: parseJsonField<string[]>(product.images),
    tags: parseJsonField<string[]>(product.tags),
  });
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
