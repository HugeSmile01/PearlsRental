import { PrismaClient, Prisma } from '@prisma/client';
import '@/lib/env';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prismaClientConfig: Prisma.PrismaClientOptions = {
  log: process.env.NODE_ENV === 'production' ? ['error', 'warn'] : ['query', 'error', 'warn'],
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient(prismaClientConfig);

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
