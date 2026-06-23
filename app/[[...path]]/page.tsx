import { fetchPublishedSchema, findPage, isDemoMode } from "@/lib/schema";
import { RenderPage } from "@/lib/blocks";

export default async function Page({
  params,
}: {
  params: Promise<{ path?: string[] }>;
}) {
  const { path } = await params;
  const schema = await fetchPublishedSchema();

  if (!schema || schema.pages.length === 0) {
    return (
      <main style={{ padding: "4rem 2rem", textAlign: "center" }}>
        <h1>Site coming soon</h1>
        <p style={{ color: "#6b7280" }}>
          Publish your design from the InfernoByte dashboard.
        </p>
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
  return {
    title: page?.title || schema?.theme.siteName || "Site",
  };
}
