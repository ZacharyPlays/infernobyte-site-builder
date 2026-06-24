import { NextResponse } from "next/server";
import { hasBuilderSession } from "@/lib/builder-auth";
import {
  fetchBuilderData,
  saveBuilderConfig,
  publishBuilderDraft,
} from "@/lib/panel-client";

export const dynamic = "force-dynamic";

/**
 * In-site builder API. The browser only ever holds the HttpOnly builder cookie;
 * this server route attaches the schema-secret HMAC and proxies to the panel,
 * so the secret never reaches the client.
 */
export async function GET() {
  if (!(await hasBuilderSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const data = await fetchBuilderData();
  if (!data) {
    return NextResponse.json({ error: "Unavailable" }, { status: 503 });
  }
  return NextResponse.json(data);
}

export async function PUT(req: Request) {
  if (!(await hasBuilderSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  // Handles both the editor (draft autosave) and the in-builder setup wizard
  // (themeId + addons + completeSetup).
  const result = await saveBuilderConfig({
    themeId: body.themeId,
    draft: body.draft,
    addons: body.addons,
    completeSetup: body.completeSetup,
  });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}

export async function POST(req: Request) {
  if (!(await hasBuilderSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  if (body.action === "publish") {
    const result = await publishBuilderDraft();
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ ok: true, published: true });
  }
  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
