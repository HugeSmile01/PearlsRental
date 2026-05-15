const baseRequiredEnvVars = ['DATABASE_URL'] as const;
const supabaseEnvVars = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'] as const;

function hasValue(value: string | undefined) {
  return Boolean(value && value.trim() !== '');
}

function validateEnv() {
  const missingBase = baseRequiredEnvVars.filter((key) => !hasValue(process.env[key]));
  if (missingBase.length > 0) {
    console.warn(
      `Missing required runtime environment variables: ${missingBase.join(', ')}. Runtime API routes may fail until these are configured.`,
    );
  }


  const hasAnySupabase = supabaseEnvVars.some((key) => hasValue(process.env[key]));
  const missingSupabase = supabaseEnvVars.filter((key) => !hasValue(process.env[key]));

  if (hasAnySupabase && missingSupabase.length > 0) {
    console.warn(`[WARN] Partial Supabase configuration detected. Missing: ${missingSupabase.join(', ')}`);
  }

}

validateEnv();

export const env = {
  DATABASE_URL: process.env.DATABASE_URL!,
  RESERVATION_EXPIRY_HOURS: Number.parseInt(process.env.RESERVATION_EXPIRY_HOURS ?? '24', 10),
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
} as const;
