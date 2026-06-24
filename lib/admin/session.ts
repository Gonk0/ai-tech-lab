import { SignJWT, jwtVerify } from "jose";
import { ADMIN_EMAIL, ADMIN_SESSION_COOKIE, ADMIN_SESSION_MAX_AGE_SECONDS } from "./constants";

type SessionPayload = {
  email: string;
};

function getSessionSecret(): Uint8Array {
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("ADMIN_SESSION_SECRET must be set and at least 32 characters");
  }

  return new TextEncoder().encode(secret);
}

export async function signSession(email: string): Promise<string> {
  return new SignJWT({ email } satisfies SessionPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${ADMIN_SESSION_MAX_AGE_SECONDS}s`)
    .sign(getSessionSecret());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSessionSecret());
    const email = payload.email;

    if (typeof email !== "string" || email !== ADMIN_EMAIL) {
      return null;
    }

    return { email };
  } catch {
    return null;
  }
}

export { ADMIN_SESSION_COOKIE, ADMIN_SESSION_MAX_AGE_SECONDS };
