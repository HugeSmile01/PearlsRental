export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const locations = await prisma.pickupLocation.findMany();
  const parsed = locations.map((l) => ({
    ...l,
    openingHours: typeof l.openingHours === 'string' ? JSON.parse(l.openingHours) : l.openingHours,
  }));
  return NextResponse.json(parsed);
}
