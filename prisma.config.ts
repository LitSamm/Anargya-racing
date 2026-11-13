import "dotenv/config";
import path from "node:path";
import { defineConfig } from "prisma/config";

// SQLite paths in DATABASE_URL are resolved from the project root so the CLI,
// the seed script and the running app all open the same file.
const raw = process.env.DATABASE_URL ?? "file:./dev.db";
const url = raw.startsWith("file:") ? `file:${path.resolve(process.cwd(), raw.slice(5))}` : raw;

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations", seed: "tsx prisma/seed.ts" },
  datasource: { url },
});
