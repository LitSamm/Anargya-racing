import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { fail, json, parseBody } from "@/lib/http";

const schema = z.object({ status: z.enum(["NEW", "CONTACTED", "CLOSED"]) });

export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireUser(request, ["ADMIN"]);
  if (auth instanceof Response) return auth;
  const body = await parseBody(request, schema);
  if (body instanceof Response) return body;
  const { id } = await ctx.params;
  if (!(await db.inquiry.findUnique({ where: { id } }))) return fail("Inquiry not found.", 404);
  return json({ inquiry: await db.inquiry.update({ where: { id }, data: body }) });
}
