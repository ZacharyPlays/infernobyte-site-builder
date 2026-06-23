import { createHmac } from "crypto";

function credentials() {
  const orderId = process.env.SITE_ORDER_ID?.trim();
  const secret = process.env.SITE_SCHEMA_SECRET?.trim();
  if (!orderId || !secret) return null;
  return { orderId, secret };
}

export function panelBaseUrl(): string {
  const schemaUrl = process.env.SITE_SCHEMA_URL?.trim();
  if (schemaUrl) {
    return schemaUrl.replace(/\/api\/site-builder\/schema\/?$/i, "");
  }
  return (
    process.env.SITE_BUILDER_PANEL_URL?.trim() ||
    process.env.SITE_PANEL_URL?.trim() ||
    ""
  ).replace(/\/$/, "");
}

function sign(orderId: string, secret: string, t: number): string {
  return createHmac("sha256", secret).update(`${orderId}:${t}`).digest("hex");
}

function signedUrl(path: string): string | null {
  const creds = credentials();
  const base = panelBaseUrl();
  if (!creds || !base) return null;
  const t = Date.now();
  const sig = sign(creds.orderId, creds.secret, t);
  const url = new URL(`${base}${path}`);
  url.searchParams.set("orderId", creds.orderId);
  url.searchParams.set("t", String(t));
  url.searchParams.set("sig", sig);
  return url.toString();
}

export type SiteStatus = {
  siteLive: boolean;
  deploymentStatus: string | null;
  orderStatus: string;
  setupComplete: boolean;
  siteUrl: string | null;
};

export type SiteConfig = {
  themeId: string;
  themes: { id: string; label: string }[];
  addons: Record<string, unknown>;
  setupComplete: boolean;
  deploymentStatus: string | null;
  siteLive: boolean;
  designerUrl: string | null;
};

export async function fetchSiteStatus(): Promise<SiteStatus | null> {
  const url = signedUrl("/api/site-builder/site-status");
  if (!url) return null;
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as SiteStatus;
  } catch {
    return null;
  }
}

export async function fetchSiteConfig(): Promise<SiteConfig | null> {
  const url = signedUrl("/api/site-builder/site-config");
  if (!url) return null;
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as SiteConfig;
  } catch {
    return null;
  }
}

export async function saveSiteConfig(body: {
  themeId?: string;
  addons?: Record<string, unknown>;
  completeSetup?: boolean;
}): Promise<{ ok: boolean; error?: string }> {
  const url = signedUrl("/api/site-builder/site-config");
  if (!url) return { ok: false, error: "Not configured" };
  try {
    const res = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) return { ok: false, error: json.error || "Save failed" };
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not reach InfernoByte" };
  }
}

export function isPreviewMode(): boolean {
  return Boolean(process.env.SITE_BUILDER_PREVIEW_PRODUCT_ID?.trim());
}
