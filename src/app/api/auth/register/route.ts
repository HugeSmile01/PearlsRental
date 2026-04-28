import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { ApiError, handleApiError, parseJsonOrThrow } from '@/lib/response';
import { parseRegister } from '@/lib/validation';
import { isRateLimited, rateLimitKey } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const key = rateLimitKey(request.headers.get('x-forwarded-for'), 'auth-register');
    if (isRateLimited(key, 8, 60_000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const body = parseRegister(await parseJsonOrThrow(request));

    const existing = await prisma.user.findUnique({ where: { email: body.email } });
    if (existing) throw new ApiError(409, 'Email already registered');

    const hashed = await bcrypt.hash(body.password, 10);
    const user = await prisma.user.create({ data: { name: body.name, email: body.email, password: hashed } });
    return NextResponse.json({ id: user.id, name: user.name, email: user.email });
  } catch (error) {
    return handleApiError(error);
  }
}
