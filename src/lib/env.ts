const requiredSupabaseEnvVars = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'] as const;
const optionalServerEnvVars = ['SUPABASE_SERVICE_ROLE_KEY'] as const;

function hasValue(value: string | undefined) {
  return Boolean(value && value.trim() !== '');
}

function validateEnv() {
  const missingSupabase = requiredSupabaseEnvVars.filter((key) => !hasValue(process.env[key]));
  if (missingSupabase.length > 0) {
    console.warn(
      `Missing required Supabase runtime environment variables: ${missingSupabase.join(', ')}. Authentication and API routes may fail until these are configured.`,
    );
  }

  const missingOptional = optionalServerEnvVars.filter((key) => !hasValue(process.env[key]));
  if (missingOptional.length > 0) {
    console.warn(`[WARN] Missing optional server environment variables: ${missingOptional.join(', ')}.`);
  }
}

validateEnv();

export const env = {
  RESERVATION_EXPIRY_HOURS: Number.parseInt(process.env.RESERVATION_EXPIRY_HOURS ?? '24', 10),
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
} as const;
