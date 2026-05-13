import '@/lib/env';

type SupabaseAuthResult = { error?: { message: string } };

async function supabaseAuthRequest(path: string, body: Record<string, unknown>): Promise<SupabaseAuthResult> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return { error: { message: 'Supabase is not configured' } };
  }

  const response = await fetch(`${url}/auth/v1/${path}`, {
    method: 'POST',
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    return { error: { message: data.msg || data.error_description || data.error || 'Supabase auth failed' } };
  }

  return {};
}

export async function supabaseSignIn(email: string, password: string) {
  return supabaseAuthRequest('token?grant_type=password', { email, password });
}

export async function supabaseSignUp(name: string, email: string, password: string) {
  return supabaseAuthRequest('signup', { email, password, data: { full_name: name } });
}
