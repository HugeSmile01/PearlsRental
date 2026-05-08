import type { Product } from '@prisma/client';

export type RecommendationSignals = {
  recentlyViewedIds?: string[];
  preferredCategories?: string[];
  preferredColors?: string[];
  preferredOccasions?: string[];
};

export function scoreProduct(product: Product, signals: RecommendationSignals) {
  let score = 0;

  if (signals.recentlyViewedIds?.includes(product.id)) score += 2;
  if (signals.preferredCategories?.includes(product.category)) score += 3;
  if (signals.preferredColors?.includes(product.color)) score += 2;
  if (signals.preferredOccasions?.includes(product.occasion)) score += 2;

  if (product.status === 'AVAILABLE') score += 2;
  if (product.status === 'RESERVED') score -= 2;
  if (product.status === 'MAINTENANCE') score -= 4;

  return score;
}
