import { getServerSession } from 'next-auth';
import { Session } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ApiError } from '@/lib/response';

export async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new ApiError(401, 'Unauthorized');
  return session;
}

export async function requireAdmin() {
  const session = await requireSession();
  if ((session.user as any).role !== 'ADMIN') throw new ApiError(403, 'Forbidden');
  return session;
}

export function isAdminSession(session: Session | null) {
  return (session?.user as any)?.role === 'ADMIN';
}
