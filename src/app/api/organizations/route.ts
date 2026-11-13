import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { json, parseBody } from "@/lib/http";

const schema = z.object({ name: z.string().trim().min(1).max(160), kind: z.enum(["ACADEMY", "TEAM", "OTHER"]).default("ACADEMY"), country: z.string().trim().min(1).max(80).default("Japan") });

export async function GET(request: Request) {
  const auth = await requireUser(request, ["ADMIN"]);
  if (auth instanceof Response) return auth;
  return json({ organizations: await db.organization.findMany({ orderBy: { createdAt: "desc" }, include: { _count: { select: { users: true, vehicles: true } } } }) });
}

export async function POST(request: Request) {
  const auth = await requireUser(request, ["ADMIN"]);
  if (auth instanceof Response) return auth;
  const body = await parseBody(request, schema);
  if (body instanceof Response) return body;
  return json({ organization: await db.organization.create({ data: body }) }, 201);
}
