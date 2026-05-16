const ACCESS_COOKIE = 'sb-access-token';

export type SupabaseSessionUser = {
  id: string;
  email?: string;
  user_metadata?: Record<string, any>;
  app_metadata?: Record<string, any>;
};

type SupabaseAuthResult = { error?: { message: string }; access_token?: string; user?: SupabaseSessionUser };

function getPublicSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !anonKey) {
    return { error: { message: 'Supabase is not configured' } } as const;
  }

  return { url, anonKey } as const;
}

async function supabaseAuthRequest(path: string, body: Record<string, unknown>): Promise<SupabaseAuthResult> {
  const config = getPublicSupabaseEnv();
  if ('error' in config) return config;

  try {
    const response = await fetch(`${config.url}/auth/v1/${path}`, {
      method: 'POST',
      headers: { apikey: config.anonKey, Authorization: `Bearer ${config.anonKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return { error: { message: data.msg || data.error_description || data.error || 'Supabase auth failed' } };
    return { access_token: data.access_token, user: data.user };
  } catch {
    return { error: { message: 'Unable to connect to Supabase. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.' } };
  }
}

export async function supabaseSignIn(email: string, password: string) {
  return supabaseAuthRequest('token?grant_type=password', { email, password });
}

export async function supabaseSignUp(name: string, email: string, password: string) {
  return supabaseAuthRequest('signup', { email, password, data: { full_name: name } });
}

export async function getSupabaseUserFromToken(token: string) {
  const config = getPublicSupabaseEnv();
  if ('error' in config || !token) return null;

  try {
    const response = await fetch(`${config.url}/auth/v1/user`, {
      headers: { apikey: config.anonKey, Authorization: `Bearer ${token}` }, cache: 'no-store',
    });
    if (!response.ok) return null;
    return (await response.json()) as SupabaseSessionUser;
  } catch {
    return null;
  }
}

export const supabaseAccessCookie = ACCESS_COOKIE;
