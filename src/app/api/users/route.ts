import { z } from "zod";
import { hashPassword, requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { fail, json, parseBody } from "@/lib/http";

const schema = z.object({
  email: z.email(), name: z.string().trim().min(1).max(120), password: z.string().min(10).max(200),
  role: z.enum(["ADMIN", "CUSTOMER"]).default("CUSTOMER"), organizationId: z.string().optional(),
});
const select = { id: true, email: true, name: true, role: true, organizationId: true, createdAt: true } as const;

/** Accounts are created by an admin: there is no public sign-up (telemetry is customers-only). */
export async function GET(request: Request) {
  const auth = await requireUser(request, ["ADMIN"]);
  if (auth instanceof Response) return auth;
  return json({ users: await db.user.findMany({ select, orderBy: { createdAt: "desc" } }) });
}

export async function POST(request: Request) {
  const auth = await requireUser(request, ["ADMIN"]);
  if (auth instanceof Response) return auth;
  const body = await parseBody(request, schema);
  if (body instanceof Response) return body;
  const email = body.email.toLowerCase();
  if (await db.user.findUnique({ where: { email } })) return fail("That email is already registered.", 409);
  if (body.organizationId && !(await db.organization.findUnique({ where: { id: body.organizationId } }))) return fail("Organization not found.", 404);
  const user = await db.user.create({ data: { email, name: body.name, role: body.role, organizationId: body.organizationId, passwordHash: await hashPassword(body.password) }, select });
  return json({ user }, 201);
}
