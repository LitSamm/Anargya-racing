import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import type { Role } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { fail, sameOrigin } from "@/lib/http";

const COOKIE = "anargya_session";
const MAX_AGE = 60 * 60 * 24 * 7;

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 32) throw new Error("AUTH_SECRET must be set to at least 32 characters.");
  return new TextEncoder().encode(value);
}

export const hashPassword = (password: string) => bcrypt.hash(password, 12);
export const verifyPassword = (password: string, hash: string) => bcrypt.compare(password, hash);

export async function startSession(userId: string) {
  const token = await new SignJWT({}).setProtectedHeader({ alg: "HS256" }).setSubject(userId).setIssuedAt().setExpirationTime(`${MAX_AGE}s`).sign(secret());
  (await cookies()).set(COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: MAX_AGE });
}

export async function endSession() { (await cookies()).delete(COOKIE); }

/** The signed-in user, loaded fresh from the database so role changes and deletions apply at once. */
export async function currentUser() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"] });
    if (!payload.sub) return null;
    return await db.user.findUnique({ where: { id: payload.sub }, select: { id: true, email: true, name: true, role: true, organizationId: true } });
  } catch { return null; }
}
export type AuthUser = NonNullable<Awaited<ReturnType<typeof currentUser>>>;

/** Usage: `const auth = await requireUser(request, ["ADMIN"]); if (auth instanceof Response) return auth;` */
export async function requireUser(request: Request, roles?: Role[]): Promise<AuthUser | Response> {
  if (request.method !== "GET" && !sameOrigin(request)) return fail("Cross-origin request blocked.", 403);
  const user = await currentUser();
  if (!user) return fail("Sign in required.", 401);
  if (roles && !roles.includes(user.role)) return fail("You do not have access to this.", 403);
  return user;
}

/** Vehicle API keys are random and long, so a plain SHA-256 is enough to store them. */
export const hashApiKey = (key: string) => createHash("sha256").update(key).digest("hex");
export const newApiKey = () => `anv_${randomBytes(24).toString("base64url")}`;

export async function vehicleFromKey(request: Request) {
  const key = request.headers.get("x-vehicle-key");
  if (!key) return null;
  return db.vehicle.findUnique({ where: { apiKeyHash: hashApiKey(key) } });
}
