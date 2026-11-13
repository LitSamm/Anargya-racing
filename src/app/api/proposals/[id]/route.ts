import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { fail, json, parseBody } from "@/lib/http";

const schema = z.object({ status: z.enum(["DRAFT", "SENT", "ACCEPTED", "REJECTED", "CANCELLED"]).optional(), notes: z.string().trim().max(4000).optional(), depositPercent: z.number().int().min(0).max(100).optional() });

/** Admin edits anything; a customer may only cancel a proposal of their own organization. */
export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireUser(request);
  if (auth instanceof Response) return auth;
  const body = await parseBody(request, schema);
  if (body instanceof Response) return body;
  const { id } = await ctx.params;
  const proposal = await db.proposal.findUnique({ where: { id } });
  if (!proposal || (auth.role !== "ADMIN" && proposal.organizationId !== auth.organizationId)) return fail("Proposal not found.", 404);
  if (auth.role !== "ADMIN") {
    if (body.status !== "CANCELLED" || body.notes !== undefined || body.depositPercent !== undefined) return fail("Customers can only cancel a proposal.", 403);
    if (proposal.status === "ACCEPTED") return fail("An accepted proposal cannot be cancelled online.", 409);
  }
  return json({ proposal: await db.proposal.update({ where: { id }, data: body }) });
}
