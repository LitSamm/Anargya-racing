import { requireUser, vehicleFromKey } from "@/lib/auth";
import { db } from "@/lib/db";
import { fail, json } from "@/lib/http";

/** Readings for one session. ?limit= (default 500, max 5000), ?after=<ISO time> for polling. */
export async function GET(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireUser(request);
  if (auth instanceof Response) return auth;
  const { id } = await ctx.params;
  const session = await db.telemetrySession.findUnique({ where: { id }, include: { vehicle: true } });
  const allowed = session && (auth.role === "ADMIN" || (session.vehicle.organizationId === auth.organizationId && session.vehicle.telemetryEnabled));
  if (!session || !allowed) return fail("Session not found.", 404);
  const params = new URL(request.url).searchParams;
  const limit = Math.min(Math.max(Number(params.get("limit")) || 500, 1), 5000);
  const after = params.get("after");
  const afterDate = after ? new Date(after) : null;
  const readings = await db.telemetryReading.findMany({
    where: { sessionId: id, ...(afterDate && !Number.isNaN(afterDate.getTime()) ? { recordedAt: { gt: afterDate } } : {}) },
    orderBy: { recordedAt: "asc" }, take: limit,
  });
  return json({ session: { id: session.id, vehicleId: session.vehicleId, driverName: session.driverName, startedAt: session.startedAt, endedAt: session.endedAt }, readings });
}

/** Car unit (x-vehicle-key): close its own session. */
export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const vehicle = await vehicleFromKey(request);
  if (!vehicle) return fail("Unknown vehicle key.", 401);
  const { id } = await ctx.params;
  const session = await db.telemetrySession.findFirst({ where: { id, vehicleId: vehicle.id } });
  if (!session) return fail("Session not found.", 404);
  return json({ session: await db.telemetrySession.update({ where: { id }, data: { endedAt: session.endedAt ?? new Date() } }) });
}
