import { z } from "zod";
import { vehicleFromKey } from "@/lib/auth";
import { db } from "@/lib/db";
import { fail, json, parseBody, rateLimit } from "@/lib/http";

const num = z.number().finite().optional();
const reading = z.object({
  recordedAt: z.coerce.date(), speedKmh: num, wheelSpeedFl: num, wheelSpeedFr: num, wheelSpeedRl: num, wheelSpeedRr: num,
  voltageV: num, currentA: num, batteryPct: z.number().min(0).max(100).optional(), motorTempC: num, inverterTempC: num, batteryTempC: num,
  latitude: z.number().min(-90).max(90).optional(), longitude: z.number().min(-180).max(180).optional(),
});
const schema = z.object({ sessionId: z.string(), readings: z.array(reading).min(1).max(500) });

/** Car unit (x-vehicle-key): upload a batch of up to 500 readings into one of its open sessions. */
export async function POST(request: Request) {
  const vehicle = await vehicleFromKey(request);
  if (!vehicle) return fail("Unknown vehicle key.", 401);
  if (!vehicle.telemetryEnabled) return fail("Telemetry is not enabled for this vehicle.", 403);
  if (!rateLimit(`ingest:${vehicle.id}`, 120, 60_000)) return fail("Too many uploads. Slow down.", 429);
  const body = await parseBody(request, schema);
  if (body instanceof Response) return body;
  const session = await db.telemetrySession.findFirst({ where: { id: body.sessionId, vehicleId: vehicle.id } });
  if (!session) return fail("Session not found.", 404);
  if (session.endedAt) return fail("Session already ended.", 409);
  const result = await db.telemetryReading.createMany({ data: body.readings.map((r) => ({ ...r, sessionId: session.id })) });
  return json({ stored: result.count }, 201);
}
