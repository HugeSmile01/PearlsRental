import { prisma } from '@/lib/prisma';
import { parseJsonField } from '@/lib/utils';
import { ProductDetail } from '@/components/product/ProductDetail';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await prisma.product.findUnique({ where: { slug: params.slug } });
  if (!product) return { title: 'Not Found' };
  return {
    title: product.name,
    description: product.description,
  };
}

export default async function ProductPage({ params }: Props) {
  const product = await prisma.product.findUnique({ where: { slug: params.slug } });
  if (!product) notFound();

  const related = await prisma.product.findMany({
    where: { category: product.category, id: { not: product.id } },
    take: 4,
  });

  const parsed = {
    ...product,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    images: parseJsonField<string[]>(product.images),
    tags: parseJsonField<string[]>(product.tags),
  };

  const parsedRelated = related.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
    images: parseJsonField<string[]>(r.images),
    tags: parseJsonField<string[]>(r.tags),
  }));

  return <ProductDetail product={parsed} related={parsedRelated} />;
}
