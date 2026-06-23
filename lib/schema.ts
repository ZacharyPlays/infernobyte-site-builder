import { createHmac } from "crypto";

export type PuckComponentData = {
  type: string;
  props: Record<string, unknown>;
};

export type SiteBuilderPage = {
  id: string;
  path: string;
  title: string;
  content: {
    content: PuckComponentData[];
    root: { props: Record<string, unknown> };
  };
};

export type SiteBuilderSchema = {
  version: 1;
  theme: {
    primaryColor: string;
    fontFamily: string;
    siteName: string;
    logoUrl?: string;
    faviconUrl?: string;
  };
  pages: SiteBuilderPage[];
  navigation: { label: string; pageId: string }[];
};

function sign(orderId: string, secret: string, t: number): string {
  return createHmac("sha256", secret).update(`${orderId}:${t}`).digest("hex");
}

export async function fetchPublishedSchema(): Promise<SiteBuilderSchema | null> {
  const previewProductId = process.env.SITE_BUILDER_PREVIEW_PRODUCT_ID?.trim();
  if (previewProductId) {
    const panelUrl =
      process.env.SITE_BUILDER_PANEL_URL?.trim() ||
      process.env.SITE_URL?.trim() ||
      "";
    if (panelUrl) {
      try {
        const url = `${panelUrl.replace(/\/$/, "")}/api/site-builder/preview-schema?productId=${encodeURIComponent(previewProductId)}`;
        const res = await fetch(url, { next: { revalidate: 300 } });
        if (res.ok) return (await res.json()) as SiteBuilderSchema;
      } catch {
        /* fall through */
      }
    }
  }

  const baseUrl = process.env.SITE_SCHEMA_URL?.trim();
  const orderId = process.env.SITE_ORDER_ID?.trim();
  const secret = process.env.SITE_SCHEMA_SECRET?.trim();
  if (!baseUrl || !orderId || !secret) return null;

  const t = Date.now();
  const sig = sign(orderId, secret, t);
  const url = new URL(baseUrl);
  url.searchParams.set("orderId", orderId);
  url.searchParams.set("t", String(t));
  url.searchParams.set("sig", sig);

  try {
    const res = await fetch(url.toString(), {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return (await res.json()) as SiteBuilderSchema;
  } catch {
    return null;
  }
}

export function findPage(
  schema: SiteBuilderSchema,
  pathSegments: string[] | undefined,
): SiteBuilderPage | null {
  const path =
    !pathSegments || pathSegments.length === 0
      ? "/"
      : `/${pathSegments.join("/")}`;
  return (
    schema.pages.find((p) => p.path === path) ??
    schema.pages.find((p) => p.path === "/") ??
    schema.pages[0] ??
    null
  );
}

export function isDemoMode(): boolean {
  return process.env.INFERNOBYTE_DEMO_MODE === "true";
}

export function paymentsEnabled(): boolean {
  return Boolean(
    process.env.SQUARE_APPLICATION_ID?.trim() &&
      process.env.SQUARE_ACCESS_TOKEN?.trim() &&
      process.env.SQUARE_LOCATION_ID?.trim(),
  );
}

export function emailEnabled(): boolean {
  return Boolean(
    process.env.RESEND_API_KEY?.trim() && process.env.FROM_EMAIL?.trim(),
  );
}
