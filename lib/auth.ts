import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE = "site_session";

function secretKey(): Uint8Array | null {
  const s = process.env.JWT_SECRET?.trim();
  if (!s) return null;
  return new TextEncoder().encode(s);
}

export async function signToken(payload: {
  sub: string;
  email: string;
  role: string;
}): Promise<string | null> {
  const key = secretKey();
  if (!key) return null;
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(key);
}

export async function verifyToken(token: string): Promise<{
  sub: string;
  email: string;
  role: string;
} | null> {
  const key = secretKey();
  if (!key) return null;
  try {
    const { payload } = await jwtVerify(token, key);
    return {
      sub: String(payload.sub || ""),
      email: String(payload.email || ""),
      role: String(payload.role || "user"),
    };
  } catch {
    return null;
  }
}

export async function getSession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function setSessionCookie(token: string) {
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.delete(COOKIE);
}
