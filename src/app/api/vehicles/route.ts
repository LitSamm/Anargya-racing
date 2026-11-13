import { z } from "zod";
import { hashApiKey, newApiKey, requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { fail, json, parseBody } from "@/lib/http";

const schema = z.object({ serial: z.string().trim().min(1).max(80), name: z.string().trim().min(1).max(120), organizationId: z.string().optional(), telemetryEnabled: z.boolean().default(false) });
const select = { id: true, serial: true, name: true, model: true, telemetryEnabled: true, organizationId: true, createdAt: true } as const;

/** Admins see every vehicle; customers see only their organization's. */
export async function GET(request: Request) {
  const auth = await requireUser(request);
  if (auth instanceof Response) return auth;
  const where = auth.role === "ADMIN" ? {} : { organizationId: auth.organizationId ?? "none" };
  return json({ vehicles: await db.vehicle.findMany({ where, select, orderBy: { createdAt: "desc" } }) });
}

/** The API key is returned once, here. Only its hash is stored. */
export async function POST(request: Request) {
  const auth = await requireUser(request, ["ADMIN"]);
  if (auth instanceof Response) return auth;
  const body = await parseBody(request, schema);
  if (body instanceof Response) return body;
  if (await db.vehicle.findUnique({ where: { serial: body.serial } })) return fail("A vehicle with that serial already exists.", 409);
  const apiKey = newApiKey();
  const vehicle = await db.vehicle.create({ data: { ...body, apiKeyHash: hashApiKey(apiKey) }, select });
  return json({ vehicle, apiKey }, 201);
}
