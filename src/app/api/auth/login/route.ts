import { z } from "zod";
import { startSession, verifyPassword } from "@/lib/auth";
import { db } from "@/lib/db";
import { clientIp, fail, json, parseBody, rateLimit, sameOrigin } from "@/lib/http";

const schema = z.object({ email: z.email(), password: z.string().min(1).max(200) });

export async function POST(request: Request) {
  if (!sameOrigin(request)) return fail("Cross-origin request blocked.", 403);
  if (!rateLimit(`login:${clientIp(request)}`, 10, 15 * 60_000)) return fail("Too many attempts. Try again later.", 429);
  const body = await parseBody(request, schema);
  if (body instanceof Response) return body;
  const user = await db.user.findUnique({ where: { email: body.email.toLowerCase() } });
  // Same answer for an unknown email and a wrong password.
  if (!user || !(await verifyPassword(body.password, user.passwordHash))) return fail("Email or password is incorrect.", 401);
  await startSession(user.id);
  return json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } });
}
