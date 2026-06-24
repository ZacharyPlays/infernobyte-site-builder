import { NextRequest, NextResponse } from "next/server";
import { startBuilderSession, verifyAccessSignature } from "@/lib/builder-auth";

export const dynamic = "force-dynamic";

// Relative redirect — building an absolute URL from req.url would use the
// container's internal bind address (e.g. 0.0.0.0:8080) instead of the public
// host. A relative Location keeps the browser on the customer's real domain.
function relativeRedirect(path: string): NextResponse {
  return new NextResponse(null, { status: 303, headers: { Location: path } });
}

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
    return relativeRedirect("/builder/denied");
  }

  await startBuilderSession();
  return relativeRedirect("/builder");
}
