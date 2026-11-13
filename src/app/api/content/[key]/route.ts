import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { fail, json, parseBody } from "@/lib/http";

const schema = z.object({ value: z.json().refine((v) => v !== null, "null is not allowed; DELETE the key instead.") });

export async function GET(request: Request, ctx: { params: Promise<{ key: string }> }) {
  void request.url;
  const item = await db.contentItem.findUnique({ where: { key: decodeURIComponent((await ctx.params).key) } });
  return item ? json({ key: item.key, value: item.value, updatedAt: item.updatedAt }) : fail("Content not found.", 404);
}

/** Admin: create or replace one content value, e.g. PUT /api/content/vehicle.priceYen {"value": 6627281} */
export async function PUT(request: Request, ctx: { params: Promise<{ key: string }> }) {
  const auth = await requireUser(request, ["ADMIN"]);
  if (auth instanceof Response) return auth;
  const body = await parseBody(request, schema);
  if (body instanceof Response) return body;
  const key = decodeURIComponent((await ctx.params).key);
  if (!/^[a-z0-9._-]{1,80}$/i.test(key)) return fail("Key may only use letters, numbers, dot, dash and underscore.", 422);
  const item = await db.contentItem.upsert({ where: { key }, create: { key, value: body.value as never }, update: { value: body.value as never } });
  return json({ key: item.key, value: item.value, updatedAt: item.updatedAt });
}

export async function DELETE(request: Request, ctx: { params: Promise<{ key: string }> }) {
  const auth = await requireUser(request, ["ADMIN"]);
  if (auth instanceof Response) return auth;
  const key = decodeURIComponent((await ctx.params).key);
  const result = await db.contentItem.deleteMany({ where: { key } });
  return result.count ? json({ ok: true }) : fail("Content not found.", 404);
}
