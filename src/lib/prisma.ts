import '@/lib/env';

/**
 * Temporary Prisma compatibility shim.
 *
 * This repository is migrating to Supabase-only data access, but some routes
 * still import `prisma`. We keep this proxy so the app can compile without the
 * `@prisma/client` package present.
 */
export const prisma = new Proxy(
  {},
  {
    get(_target, property) {
      throw new Error(
        `Prisma client is not available. Attempted to access prisma.${String(property)}. ` +
          'Migrate this call to Supabase data access.'
      );
    },
  }
) as any;
