import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { clientIp, fail, json, parseBody, rateLimit, sameOrigin } from "@/lib/http";

const schema = z.object({
  name: z.string().trim().min(1).max(120), organization: z.string().trim().min(1).max(160), email: z.email(),
  kind: z.enum(["QUESTION", "FEEDBACK", "PRESENTATION", "EVALUATION", "FLEET", "TELEMETRY", "OTHER"]).default("OTHER"), message: z.string().trim().min(1).max(4000),
  website: z.string().max(0).optional(), // honeypot: real people leave it empty
});

/** Public: the contact form posts here. */
export async function POST(request: Request) {
  if (!sameOrigin(request)) return fail("Cross-origin request blocked.", 403);
  if (!rateLimit(`inquiry:${clientIp(request)}`, 5, 60 * 60_000)) return fail("Too many messages. Try again later.", 429);
  const body = await parseBody(request, schema);
  if (body instanceof Response) return body;
  const { website, ...data } = body; void website;
  const inquiry = await db.inquiry.create({ data: { ...data, email: data.email.toLowerCase() } });
  return json({ id: inquiry.id, received: true }, 201);
}

/** Admin: list, filter by ?status=NEW|CONTACTED|CLOSED. */
export async function GET(request: Request) {
  const auth = await requireUser(request, ["ADMIN"]);
  if (auth instanceof Response) return auth;
  const status = new URL(request.url).searchParams.get("status");
  const valid = status === "NEW" || status === "CONTACTED" || status === "CLOSED" ? status : undefined;
  return json({ inquiries: await db.inquiry.findMany({ where: { status: valid }, orderBy: { createdAt: "desc" }, take: 200 }) });
}
