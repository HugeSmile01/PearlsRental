const requiredEnvVars = ['DATABASE_URL', 'NEXTAUTH_SECRET', 'NEXTAUTH_URL'] as const;

function validateEnv() {
  const missing = requiredEnvVars.filter((key) => !process.env[key] || process.env[key]?.trim() === '');

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  // In genuine production deployments you should use PostgreSQL (or another
  // server DB). For local builds we allow an override so `next build` can run
  // when NODE_ENV=production in local dev environments (for example CI or
  // some build tools).
  const skipSqliteGuard = process.env.SKIP_SQLITE_PRODUCTION_CHECK === 'true';
  if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL?.startsWith('file:')) {
    if (!skipSqliteGuard) {
      console.warn('[WARN] SQLite DATABASE_URL in production. For real deployments, use PostgreSQL.');
    }
  }
}

validateEnv();

export const env = {
  DATABASE_URL: process.env.DATABASE_URL!,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET!,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL!,
  RESERVATION_EXPIRY_HOURS: Number.parseInt(process.env.RESERVATION_EXPIRY_HOURS ?? '24', 10),
} as const;
