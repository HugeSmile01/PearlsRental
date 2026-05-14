import { ApiError } from '@/lib/response';
import { getServerSupabaseSession } from '@/lib/supabase-server';

export async function requireSession() {
  const session = await getServerSupabaseSession();
  if (!session?.user) throw new ApiError(401, 'Unauthorized');
  return session;
}

export async function requireAdmin() {
  const session = await requireSession();
  const role = session.user.app_metadata?.role || session.user.user_metadata?.role;
  if (role !== 'ADMIN') throw new ApiError(403, 'Forbidden');
  return session;
}

export function isAdminSession(session: any) {
  const role = session?.user?.app_metadata?.role || session?.user?.user_metadata?.role;
  return role === 'ADMIN';
}
