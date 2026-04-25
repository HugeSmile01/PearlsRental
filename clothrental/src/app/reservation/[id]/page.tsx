import { prisma } from '@/lib/prisma';
import { parseJsonField } from '@/lib/utils';
import { notFound } from 'next/navigation';
import { ReservationDetail } from '@/components/rental/ReservationDetail';

export default async function ReservationPage({ params }: { params: { id: string } }) {
  const rental = await prisma.rental.findUnique({
    where: { id: params.id },
    include: {
      product: true,
      user: { select: { id: true, name: true, email: true } },
    },
  });

  if (!rental) notFound();

  const location = await prisma.pickupLocation.findFirst();

  const parsed = {
    ...rental,
    startDate: rental.startDate.toISOString(),
    endDate: rental.endDate.toISOString(),
    createdAt: rental.createdAt.toISOString(),
    updatedAt: rental.updatedAt.toISOString(),
    expiresAt: rental.expiresAt.toISOString(),
    product: rental.product ? {
      ...rental.product,
      images: parseJsonField<string[]>(rental.product.images),
      tags: parseJsonField<string[]>(rental.product.tags),
      createdAt: rental.product.createdAt.toISOString(),
      updatedAt: rental.product.updatedAt.toISOString(),
    } : null,
    user: rental.user ? {
      ...rental.user,
      createdAt: new Date().toISOString(),
    } : null,
  };

  const parsedLocation = location ? {
    ...location,
    openingHours: parseJsonField<Record<string, string>>(location.openingHours),
    createdAt: location.createdAt.toISOString(),
  } : null;

  return <ReservationDetail rental={parsed as any} location={parsedLocation as any} />;
}
