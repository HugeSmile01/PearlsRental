const baseRequiredEnvVars = ['DATABASE_URL'] as const;
const nextAuthEnvVars = ['NEXTAUTH_SECRET', 'NEXTAUTH_URL'] as const;
const supabaseEnvVars = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'] as const;

function hasValue(value: string | undefined) {
  return Boolean(value && value.trim() !== '');
}

function validateEnv() {
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return;
  }

  const missingBase = baseRequiredEnvVars.filter((key) => !hasValue(process.env[key]));
  if (missingBase.length > 0) {
    throw new Error(`Missing required environment variables: ${missingBase.join(', ')}`);
  }

  const missingNextAuth = nextAuthEnvVars.filter((key) => !hasValue(process.env[key]));
  if (missingNextAuth.length > 0) {
    console.warn(`[WARN] Missing NextAuth environment variables: ${missingNextAuth.join(', ')}. NextAuth routes may be unavailable.`);
  }

  const hasAnySupabase = supabaseEnvVars.some((key) => hasValue(process.env[key]));
  const missingSupabase = supabaseEnvVars.filter((key) => !hasValue(process.env[key]));

  if (hasAnySupabase && missingSupabase.length > 0) {
    console.warn(`[WARN] Partial Supabase configuration detected. Missing: ${missingSupabase.join(', ')}`);
  }

  const skipSqliteGuard = process.env.SKIP_SQLITE_PRODUCTION_CHECK === 'true';
  if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL?.startsWith('file:') && !skipSqliteGuard) {
    console.warn('[WARN] SQLite DATABASE_URL in production. For real deployments, use PostgreSQL.');
  }
}

validateEnv();

export const env = {
  DATABASE_URL: process.env.DATABASE_URL!,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  RESERVATION_EXPIRY_HOURS: Number.parseInt(process.env.RESERVATION_EXPIRY_HOURS ?? '24', 10),
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
} as const;
