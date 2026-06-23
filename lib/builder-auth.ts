import { createHmac, timingSafeEqual } from "crypto";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const BUILDER_COOKIE = "ib_builder_session";
const ACCESS_TTL_MS = 5 * 60 * 1000;
const SESSION_TTL_SECONDS = 60 * 60 * 8;

function orderId(): string {
  return process.env.SITE_ORDER_ID?.trim() || "";
}

function schemaSecret(): string {
  return process.env.SITE_SCHEMA_SECRET?.trim() || "";
}

/** Builder credentials always exist for a provisioned site-builder deployment. */
export function builderConfigured(): boolean {
  return Boolean(orderId() && schemaSecret());
}

function sessionKey(): Uint8Array | null {
  const secret = schemaSecret();
  if (!secret) return null;
  // Namespaced so a builder session token can never be confused with a schema sig.
  return new TextEncoder().encode(`builder:${secret}`);
}

/**
 * Validate the one-time handoff link minted by the InfernoByte panel. The token
 * is short-lived and only ever exchanged for an HttpOnly cookie, so it is never
 * persisted in the browser.
 */
export function verifyAccessSignature(
  reqOrderId: string,
  t: number,
  sig: string,
): boolean {
  const expectedOrder = orderId();
  const secret = schemaSecret();
  if (!expectedOrder || !secret || !sig) return false;
  if (reqOrderId !== expectedOrder) return false;
  if (!Number.isFinite(t) || Math.abs(Date.now() - t) > ACCESS_TTL_MS) {
    return false;
  }
  const expected = createHmac("sha256", secret)
    .update(`${reqOrderId}:${t}`)
    .digest("hex");
  try {
    const a = Buffer.from(expected, "hex");
    const b = Buffer.from(sig, "hex");
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

async function signBuilderSession(): Promise<string | null> {
  const key = sessionKey();
  if (!key) return null;
  return new SignJWT({ scope: "builder", order: orderId() })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(key);
}

export async function startBuilderSession(): Promise<void> {
  const token = await signBuilderSession();
  if (!token) return;
  const jar = await cookies();
  jar.set(BUILDER_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function hasBuilderSession(): Promise<boolean> {
  const key = sessionKey();
  if (!key) return false;
  const jar = await cookies();
  const token = jar.get(BUILDER_COOKIE)?.value;
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, key);
    return payload.scope === "builder" && payload.order === orderId();
  } catch {
    return false;
  }
}

export async function clearBuilderSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(BUILDER_COOKIE);
}
