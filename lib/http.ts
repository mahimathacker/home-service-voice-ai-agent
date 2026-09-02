import { NextResponse } from "next/server";

export async function readJson(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body: unknown = await request.json();
    return body !== null && typeof body === "object" && !Array.isArray(body)
      ? (body as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

export function apiError(error: string, code: string, status = 400) {
  return NextResponse.json({ error, code }, { status });
}

export function pinFrom(body: Record<string, unknown>) {
  return body.pin_code ?? body.postal_code;
}
