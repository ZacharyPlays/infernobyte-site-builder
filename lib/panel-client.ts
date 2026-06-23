import { createHmac } from "crypto";

function credentials() {
  const orderId = process.env.SITE_ORDER_ID?.trim();
  const secret = process.env.SITE_SCHEMA_SECRET?.trim();
  if (!orderId || !secret) return null;
  return { orderId, secret };
}

function isLoopbackUrl(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
  } catch {
    return false;
  }
}

export function hasRuntimeCredentials(): boolean {
  return credentials() !== null;
}

export function panelBaseUrl(): string {
  const explicit = process.env.SITE_BUILDER_PANEL_URL?.trim().replace(/\/$/, "");
  if (explicit && (!isProductionRuntime() || !isLoopbackUrl(explicit))) {
    return explicit;
  }

  const schemaUrl = process.env.SITE_SCHEMA_URL?.trim();
  if (schemaUrl) {
    const fromSchema = schemaUrl.replace(/\/api\/site-builder\/schema\/?$/i, "");
    if (!isProductionRuntime() || !isLoopbackUrl(fromSchema)) {
      return fromSchema;
    }
  }

  const fallback =
    process.env.SITE_PANEL_URL?.trim().replace(/\/$/, "") || "";
  if (fallback && (!isProductionRuntime() || !isLoopbackUrl(fallback))) {
    return fallback;
  }

  return "";
}

function isProductionRuntime(): boolean {
  return process.env.NODE_ENV === "production";
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

export type PanelFetchFailure =
  | "missing_credentials"
  | "missing_panel_url"
  | "unreachable"
  | "forbidden";

async function panelFetch<T>(
  path: string,
): Promise<{ data: T | null; error: PanelFetchFailure | null }> {
  if (!credentials()) {
    return { data: null, error: "missing_credentials" };
  }
  const url = signedUrl(path);
  if (!url) {
    return { data: null, error: "missing_panel_url" };
  }
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (res.status === 403 || res.status === 401) {
      return { data: null, error: "forbidden" };
    }
    if (!res.ok) {
      return { data: null, error: "unreachable" };
    }
    return { data: (await res.json()) as T, error: null };
  } catch {
    return { data: null, error: "unreachable" };
  }
}

export async function fetchSiteStatus(): Promise<SiteStatus | null> {
  const { data } = await panelFetch<SiteStatus>("/api/site-builder/site-status");
  return data;
}

export async function fetchSiteStatusDetailed(): Promise<{
  status: SiteStatus | null;
  error: PanelFetchFailure | null;
}> {
  const result = await panelFetch<SiteStatus>("/api/site-builder/site-status");
  return { status: result.data, error: result.error };
}

export async function fetchSiteConfig(): Promise<SiteConfig | null> {
  const { data } = await panelFetch<SiteConfig>("/api/site-builder/site-config");
  return data;
}

export async function fetchSiteConfigDetailed(): Promise<{
  config: SiteConfig | null;
  error: PanelFetchFailure | null;
}> {
  const result = await panelFetch<SiteConfig>("/api/site-builder/site-config");
  return { config: result.data, error: result.error };
}

export async function saveSiteConfig(body: {
  themeId?: string;
  addons?: Record<string, unknown>;
  completeSetup?: boolean;
}): Promise<{ ok: boolean; error?: string }> {
  const url = signedUrl("/api/site-builder/site-config");
  if (!url) {
    if (!credentials()) return { ok: false, error: "Site not linked to InfernoByte yet" };
    return { ok: false, error: "Panel URL is not configured" };
  }
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

export function panelConnectionErrorMessage(
  error: PanelFetchFailure | null,
): string {
  switch (error) {
    case "missing_credentials":
      return "missing_config";
    case "missing_panel_url":
      return "missing_panel_url";
    case "forbidden":
      return "auth_failed";
    case "unreachable":
      return "connecting";
    default:
      return "connecting";
  }
}
