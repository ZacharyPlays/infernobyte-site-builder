import { NextResponse } from "next/server";
import {
  fetchSiteConfig,
  fetchSiteStatus,
  saveSiteConfig,
} from "@/lib/panel-client";

// Reads runtime credentials each call (used by the panel to probe link status).
export const dynamic = "force-dynamic";

export async function GET() {
  const [status, config] = await Promise.all([
    fetchSiteStatus(),
    fetchSiteConfig(),
  ]);
  if (!status && !config) {
    return NextResponse.json({ error: "Unavailable" }, { status: 503 });
  }
  return NextResponse.json({ status, config });
}

export async function PUT(req: Request) {
  const body = await req.json().catch(() => ({}));
  const result = await saveSiteConfig(body);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
