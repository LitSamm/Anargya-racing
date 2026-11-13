import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";
import { createHash, randomBytes } from "node:crypto";
import path from "node:path";
import { PrismaClient } from "../src/generated/prisma/client";

const raw = process.env.DATABASE_URL ?? "file:./dev.db";
const url = raw.startsWith("file:") ? `file:${path.resolve(process.cwd(), raw.slice(5))}` : raw;
const db = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url }) });

const content: Record<string, unknown> = {
  "vehicle.priceYen": 6627281,
  "company.profile": {
    summary: "Anargya is an automotive startup based in Nagoya, Japan, focused on electric vehicle (EV) technology.",
    detail: "We design cost-efficient Formula Student concept EVs, built by trusted manufacturing partners and supported by digital services, for racing academies worldwide.",
  },
  "sales.roadmap": [
    { year: "2027", stage: "Prototype and manufacturing partner", cars: 0 },
    { year: "2028", stage: "Japan market expansion", cars: 5 },
    { year: "2029", stage: "Asia-Pacific expansion", cars: 15 },
    { year: "2030", stage: "Selected international markets", cars: 40 },
    { year: "2031", stage: "Planned annual sales", cars: 60 },
  ],
};

async function main() {
  const email = process.env.ADMIN_EMAIL?.toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD in .env before seeding.");
  await db.user.upsert({ where: { email }, update: {}, create: { email, name: "Anargya Admin", role: "ADMIN", passwordHash: await bcrypt.hash(password, 12) } });
  for (const [key, value] of Object.entries(content)) {
    // Only create missing keys, so re-seeding never overwrites edits made through the API.
    await db.contentItem.upsert({ where: { key }, update: {}, create: { key, value: value as never } });
  }
  if (!(await db.vehicle.findUnique({ where: { serial: "DEMO-001" } }))) {
    const org = await db.organization.create({ data: { name: "Demo Racing Academy", kind: "ACADEMY", country: "Japan" } });
    const key = `anv_${randomBytes(24).toString("base64url")}`;
    await db.vehicle.create({ data: { serial: "DEMO-001", name: "Demo car", telemetryEnabled: true, organizationId: org.id, apiKeyHash: createHash("sha256").update(key).digest("hex") } });
    console.log(`Demo vehicle DEMO-001 created. Its telemetry key (shown once): ${key}`);
  }
  console.log(`Seed done. Admin: ${email}`);
}
main().finally(() => db.$disconnect());
