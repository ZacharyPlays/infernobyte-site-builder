import { NextRequest, NextResponse } from "next/server";
import { startBuilderSession, verifyAccessSignature } from "@/lib/builder-auth";

export const dynamic = "force-dynamic";

/**
 * Handoff endpoint. The InfernoByte dashboard links here with a short-lived HMAC
 * token; we verify it, set an HttpOnly session cookie, then redirect to a clean
 * /builder URL so the token never lingers in the address bar or browser history.
 */
export async function GET(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get("orderId")?.trim() || "";
  const sig = req.nextUrl.searchParams.get("sig")?.trim() || "";
  const t = Number(req.nextUrl.searchParams.get("t")?.trim() || "");

  if (!verifyAccessSignature(orderId, t, sig)) {
    return NextResponse.redirect(new URL("/builder/denied", req.url));
  }

  await startBuilderSession();
  return NextResponse.redirect(new URL("/builder", req.url));
}
