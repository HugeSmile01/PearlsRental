import { useQuery } from '@tanstack/react-query';

export function useAvailability(productId: string, startDate?: Date, endDate?: Date) {
  return useQuery({
    queryKey: ['availability', productId, startDate?.toISOString(), endDate?.toISOString()],
    queryFn: async () => {
      if (!startDate || !endDate) return { available: true };
      const params = new URLSearchParams({
        productId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });
      const res = await fetch(`/api/rentals/availability?${params}`);
      return res.json() as Promise<{ available: boolean }>;
    },
    enabled: !!startDate && !!endDate,
  });
}

export function useProducts(filters?: Record<string, string>) {
  const params = new URLSearchParams(filters);
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => fetch(`/api/products?${params}`).then((r) => r.json()),
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: () => fetch(`/api/products/${slug}`).then((r) => r.json()),
    enabled: !!slug,
  });
}

export function useRentals() {
  return useQuery({
    queryKey: ['rentals'],
    queryFn: () => fetch('/api/rentals').then((r) => r.json()),
  });
}

export function useLocations() {
  return useQuery({
    queryKey: ['locations'],
    queryFn: () => fetch('/api/locations').then((r) => r.json()),
  });
}
