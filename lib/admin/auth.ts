import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { ADMIN_EMAIL } from "./constants";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE_SECONDS,
  signSession,
  verifySessionToken,
} from "./session";
import { getDb } from "@/lib/db";
import { ensureSchema } from "@/lib/db/ensure-schema";
import { adminUsers } from "@/lib/db/schema";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}

export async function createSession(email: string): Promise<void> {
  const token = await signSession(email);
  const cookieStore = await cookies();

  cookieStore.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
  });
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  return verifySessionToken(token);
}

export async function adminSetupRequired(): Promise<boolean> {
  await ensureSchema();
  const users = await getDb().select({ id: adminUsers.id }).from(adminUsers).limit(1);
  return users.length === 0;
}

export async function createInitialAdmin(password: string): Promise<void> {
  await ensureSchema();
  const required = await adminSetupRequired();

  if (!required) {
    throw new Error("Admin account already exists");
  }

  await getDb().insert(adminUsers).values({
    id: crypto.randomUUID(),
    email: ADMIN_EMAIL,
    passwordHash: await hashPassword(password),
    createdAt: new Date().toISOString(),
  });
}

export async function authenticateAdmin(password: string): Promise<boolean> {
  await ensureSchema();
  const [user] = await getDb()
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.email, ADMIN_EMAIL))
    .limit(1);

  if (!user) {
    return false;
  }

  const valid = await verifyPassword(password, user.passwordHash);

  if (!valid) {
    return false;
  }

  await createSession(ADMIN_EMAIL);
  return true;
}

export async function requireAdminSession() {
  const session = await getSession();

  if (!session) {
    throw new Error("Unauthorized");
  }

  return session;
}
