import { cookies } from 'next/headers';
import { getSupabaseUserFromToken, supabaseAccessCookie } from '@/lib/supabase';

export async function getServerSupabaseSession() {
  const token = (await cookies()).get(supabaseAccessCookie)?.value;
  if (!token) return null;
  const user = await getSupabaseUserFromToken(token);
  if (!user) return null;
  return { user, accessToken: token };
}
