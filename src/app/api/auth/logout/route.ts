import { endSession } from "@/lib/auth";
import { fail, json, sameOrigin } from "@/lib/http";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return fail("Cross-origin request blocked.", 403);
  await endSession();
  return json({ ok: true });
}
