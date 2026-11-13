import { z } from "zod";
import { requireUser, vehicleFromKey } from "@/lib/auth";
import { db } from "@/lib/db";
import { fail, json, parseBody } from "@/lib/http";

const startSchema = z.object({ driverName: z.string().trim().max(120).optional() });

/** Car unit (x-vehicle-key): start a session. */
export async function POST(request: Request) {
  const vehicle = await vehicleFromKey(request);
  if (!vehicle) return fail("Unknown vehicle key.", 401);
  if (!vehicle.telemetryEnabled) return fail("Telemetry is not enabled for this vehicle.", 403);
  const body = await parseBody(request, startSchema);
  if (body instanceof Response) return body;
  const session = await db.telemetrySession.create({ data: { vehicleId: vehicle.id, driverName: body.driverName } });
  return json({ session }, 201);
}

/** Signed-in users: list sessions for vehicles they may see. Optional ?vehicleId= */
export async function GET(request: Request) {
  const auth = await requireUser(request);
  if (auth instanceof Response) return auth;
  const vehicleId = new URL(request.url).searchParams.get("vehicleId") ?? undefined;
  const vehicle = auth.role === "ADMIN" ? {} : { organizationId: auth.organizationId ?? "none", telemetryEnabled: true };
  const sessions = await db.telemetrySession.findMany({ where: { vehicleId, vehicle }, orderBy: { startedAt: "desc" }, take: 100, include: { _count: { select: { readings: true } } } });
  return json({ sessions });
}
