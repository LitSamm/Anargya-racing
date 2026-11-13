import { NextResponse } from "next/server";
import type { ZodType } from "zod";

export const json = (data: unknown, status = 200) => NextResponse.json(data, { status });
export const fail = (message: string, status = 400, extra?: Record<string, unknown>) => NextResponse.json({ error: message, ...extra }, { status });

/** Parses a JSON body against a zod schema. Returns the data, or a ready-made 400 response. */
export async function parseBody<T>(request: Request, schema: ZodType<T>): Promise<T | Response> {
  let body: unknown;
  try { body = await request.json(); } catch { return fail("Request body must be valid JSON."); }
  const result = schema.safeParse(body);
  if (!result.success) return fail("Invalid request.", 422, { issues: result.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })) });
  return result.data;
}

/** Rejects cross-site browser writes. Non-browser clients (no Origin header) are allowed. */
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try { return new URL(origin).host === request.headers.get("host"); } catch { return false; }
}

const hits = new Map<string, number[]>();
/** Small in-memory limiter: fine for one server process; use a shared store if you scale out. */
export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) { hits.set(key, recent); return false; }
  recent.push(now); hits.set(key, recent);
  return true;
}

export const clientIp = (request: Request) => request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
