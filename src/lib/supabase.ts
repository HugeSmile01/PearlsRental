import '@/lib/env';
import { cookies } from 'next/headers';

const ACCESS_COOKIE = 'sb-access-token';

export type SupabaseSessionUser = {
  id: string;
  email?: string;
  user_metadata?: Record<string, any>;
  app_metadata?: Record<string, any>;
};

type SupabaseAuthResult = { error?: { message: string }; access_token?: string; user?: SupabaseSessionUser };

async function supabaseAuthRequest(path: string, body: Record<string, unknown>): Promise<SupabaseAuthResult> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return { error: { message: 'Supabase is not configured' } };

  const response = await fetch(`${url}/auth/v1/${path}`, {
    method: 'POST',
    headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) return { error: { message: data.msg || data.error_description || data.error || 'Supabase auth failed' } };
  return { access_token: data.access_token, user: data.user };
}

export async function supabaseSignIn(email: string, password: string) {
  return supabaseAuthRequest('token?grant_type=password', { email, password });
}

export async function supabaseSignUp(name: string, email: string, password: string) {
  return supabaseAuthRequest('signup', { email, password, data: { full_name: name } });
}

export async function getSupabaseUserFromToken(token: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey || !token) return null;
  const response = await fetch(`${url}/auth/v1/user`, {
    headers: { apikey: anonKey, Authorization: `Bearer ${token}` }, cache: 'no-store',
  });
  if (!response.ok) return null;
  return (await response.json()) as SupabaseSessionUser;
}

export async function getServerSupabaseSession() {
  const token = (await cookies()).get(ACCESS_COOKIE)?.value;
  if (!token) return null;
  const user = await getSupabaseUserFromToken(token);
  if (!user) return null;
  return { user, accessToken: token };
}

export const supabaseAccessCookie = ACCESS_COOKIE;
