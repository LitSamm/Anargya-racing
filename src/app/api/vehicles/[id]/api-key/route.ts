import { hashApiKey, newApiKey, requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { fail, json } from "@/lib/http";

/** Rotates the telemetry key. The old key stops working immediately. */
export async function POST(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireUser(request, ["ADMIN"]);
  if (auth instanceof Response) return auth;
  const { id } = await ctx.params;
  if (!(await db.vehicle.findUnique({ where: { id } }))) return fail("Vehicle not found.", 404);
  const apiKey = newApiKey();
  await db.vehicle.update({ where: { id }, data: { apiKeyHash: hashApiKey(apiKey) } });
  return json({ apiKey });
}
