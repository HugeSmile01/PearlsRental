export const dynamic = 'force-dynamic';
import { ProductDetail } from '@/components/product/ProductDetail';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getProductBySlug, getRelatedProducts } from '@/lib/products';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const result = await getProductBySlug(params.slug);
  if (!result.ok || !result.data) return { title: 'Not Found' };
  return {
    title: result.data.name,
    description: result.data.description,
  };
}

export default async function ProductPage({ params }: Props) {
  const productResult = await getProductBySlug(params.slug);
  if (!productResult.ok || !productResult.data) notFound();

  const product = productResult.data!;
  const relatedResult = await getRelatedProducts(product.category, product.id, 4);
  const related = relatedResult.ok ? relatedResult.data : [];
  return <ProductDetail product={product} related={related} />;
}
