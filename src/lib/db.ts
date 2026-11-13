import path from "node:path";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@/generated/prisma/client";

/** Resolves `file:./x.db` from the project root so every entry point opens the same file. */
export function databaseUrl() {
  const raw = process.env.DATABASE_URL ?? "file:./dev.db";
  return raw.startsWith("file:") ? `file:${path.resolve(process.cwd(), raw.slice(5))}` : raw;
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db = globalForPrisma.prisma ?? new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: databaseUrl() }) });
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
