import { NextResponse } from 'next/server';
import { supabaseAccessCookie } from '@/lib/supabase';

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(supabaseAccessCookie, '', { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 0 });
  return res;
}
