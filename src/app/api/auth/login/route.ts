import { NextRequest, NextResponse } from 'next/server';
import { supabaseSignIn, supabaseAccessCookie } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  const result = await supabaseSignIn(email, password);
  if (result.error || !result.access_token) return NextResponse.json({ error: result.error?.message || 'Invalid credentials' }, { status: 401 });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(supabaseAccessCookie, result.access_token, { httpOnly: true, sameSite: 'lax', path: '/' });
  return res;
}
