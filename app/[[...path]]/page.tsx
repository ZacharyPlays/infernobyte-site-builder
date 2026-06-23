import { fetchPublishedSchema, findPage, isDemoMode } from "@/lib/schema";
import { fetchSiteStatus, isPreviewMode } from "@/lib/panel-client";
import { RenderPage } from "@/lib/blocks";
import { BuildingScreen } from "@/components/OnSiteSetup";
import { redirect } from "next/navigation";

// Render per-request — site status + credentials come from runtime env, not build time.
export const dynamic = "force-dynamic";

export default async function Page({
  params,
}: {
  params: Promise<{ path?: string[] }>;
}) {
  const { path } = await params;

  if (!isPreviewMode()) {
    const status = await fetchSiteStatus();
    if (status && !status.siteLive) {
      return <BuildingScreen status={status.deploymentStatus} />;
    }
    if (status && !status.setupComplete) {
      redirect("/setup");
    }
  }

  const schema = await fetchPublishedSchema();

  if (!schema || schema.pages.length === 0) {
    if (!isPreviewMode()) {
      redirect("/setup");
    }
    return (
      <main style={{ padding: "4rem 2rem", textAlign: "center" }}>
        <h1>Site coming soon</h1>
        <p style={{ color: "#6b7280" }}>Preview mode — no published schema yet.</p>
      </main>
    );
  }

  const page = findPage(schema, path);
  if (!page) {
    return (
      <main style={{ padding: "4rem 2rem", textAlign: "center" }}>
        <h1>Page not found</h1>
      </main>
    );
  }

  const { primaryColor, fontFamily } = schema.theme;

  return (
    <main style={{ fontFamily: fontFamily || undefined }}>
      {isDemoMode() ? (
        <div className="demo-banner">
          Preview mode — purchase to remove this banner and go live on your domain.
        </div>
      ) : null}
      <RenderPage
        blocks={page.content.content}
        primaryColor={primaryColor || "#6366f1"}
      />
    </main>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ path?: string[] }>;
}) {
  const { path } = await params;
  const schema = await fetchPublishedSchema();
  const page = schema ? findPage(schema, path) : null;
  const favicon = schema?.theme.faviconUrl?.trim();
  return {
    title: page?.title || schema?.theme.siteName || "Site",
    // Customer-set favicon overrides the bundled default (app/icon.svg).
    ...(favicon ? { icons: { icon: favicon } } : {}),
  };
}
