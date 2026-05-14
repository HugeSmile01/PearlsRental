import { NextResponse } from 'next/server';
import { getServerSupabaseSession } from '@/lib/supabase';

export async function GET() {
  const session = await getServerSupabaseSession();
  if (!session) return NextResponse.json({ user: null });
  const role = session.user.app_metadata?.role || session.user.user_metadata?.role || 'USER';
  return NextResponse.json({ user: { id: session.user.id, email: session.user.email, name: session.user.user_metadata?.full_name, role } });
}
