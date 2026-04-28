import { NextResponse } from 'next/server';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export function jsonError(status: number, error: string) {
  return NextResponse.json({ error }, { status });
}

export function handleApiError(error: unknown) {
  if (error instanceof ApiError) return jsonError(error.status, error.message);



  const maybePrisma = error as { code?: string } | null;
  if (maybePrisma?.code === 'P2025') return jsonError(404, 'Resource not found');
  if (maybePrisma?.code === 'P2002') return jsonError(409, 'Duplicate resource');

  if (error instanceof SyntaxError) return jsonError(400, 'Malformed JSON payload');

  return jsonError(500, 'Internal server error');
}

export async function parseJsonOrThrow<T>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    throw new ApiError(400, 'Malformed JSON payload');
  }
}
