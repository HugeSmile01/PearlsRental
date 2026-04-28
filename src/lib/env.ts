const requiredEnvVars = ['DATABASE_URL', 'NEXTAUTH_SECRET', 'NEXTAUTH_URL'] as const;

function validateEnv() {
  const missing = requiredEnvVars.filter((key) => !process.env[key] || process.env[key]?.trim() === '');

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL?.startsWith('file:')) {
    throw new Error('SQLite DATABASE_URL is not allowed in production. Use PostgreSQL DATABASE_URL.');
  }
}

validateEnv();

export const env = {
  DATABASE_URL: process.env.DATABASE_URL!,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET!,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL!,
  RESERVATION_EXPIRY_HOURS: Number.parseInt(process.env.RESERVATION_EXPIRY_HOURS ?? '24', 10),
} as const;
