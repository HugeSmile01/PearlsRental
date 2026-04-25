import { prisma } from '@/lib/prisma';
import { parseJsonField } from '@/lib/utils';
import { LocationPageClient } from '@/components/map/LocationPageClient';

export default async function LocationPage() {
  const locations = await prisma.pickupLocation.findMany();
  const parsed = locations.map((l) => ({
    ...l,
    openingHours: parseJsonField<Record<string, string>>(l.openingHours),
    createdAt: l.createdAt.toISOString(),
  }));
  return <LocationPageClient locations={parsed as any} />;
}
