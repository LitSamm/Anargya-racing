import { randomBytes } from "node:crypto";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { fail, json, parseBody } from "@/lib/http";

const schema = z.object({
  quantity: z.number().int().min(1).max(500), notes: z.string().trim().max(4000).optional(),
  // Admin only: which organization, and an overriding price/deposit.
  organizationId: z.string().optional(), unitPriceYen: z.number().int().positive().optional(), depositPercent: z.number().int().min(0).max(100).optional(),
});

const DEFAULT_PRICE_YEN = 6_627_281;
const number = () => `AN-${new Date().getFullYear()}-${randomBytes(3).toString("hex").toUpperCase()}`;

export async function GET(request: Request) {
  const auth = await requireUser(request);
  if (auth instanceof Response) return auth;
  const where = auth.role === "ADMIN" ? {} : { organizationId: auth.organizationId ?? "none" };
  return json({ proposals: await db.proposal.findMany({ where, orderBy: { createdAt: "desc" }, take: 200, include: { organization: { select: { id: true, name: true } } } }) });
}

/** A customer requests a proposal for their own organization; the price is always set by the server. */
export async function POST(request: Request) {
  const auth = await requireUser(request);
  if (auth instanceof Response) return auth;
  const body = await parseBody(request, schema);
  if (body instanceof Response) return body;
  const admin = auth.role === "ADMIN";
  const organizationId = admin ? body.organizationId : auth.organizationId;
  if (!organizationId) return fail(admin ? "organizationId is required." : "Your account is not linked to an organization.", 422);
  if (!(await db.organization.findUnique({ where: { id: organizationId } }))) return fail("Organization not found.", 404);
  const priced = await db.contentItem.findUnique({ where: { key: "vehicle.priceYen" } });
  const listPrice = typeof priced?.value === "number" ? priced.value : DEFAULT_PRICE_YEN;
  const proposal = await db.proposal.create({ data: {
    number: number(), organizationId, requestedById: auth.id, quantity: body.quantity, notes: body.notes,
    unitPriceYen: admin && body.unitPriceYen ? body.unitPriceYen : listPrice, depositPercent: admin ? body.depositPercent : undefined,
  } });
  return json({ proposal }, 201);
}
