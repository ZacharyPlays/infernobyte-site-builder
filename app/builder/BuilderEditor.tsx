"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Puck, type Data } from "@measured/puck";
import { createPuckConfig } from "@/lib/puck-config";
import type { SiteBuilderSchema, SiteBuilderPage } from "@/lib/schema";
import Logo from "@/components/Logo";

type LoadedData = {
  draft: SiteBuilderSchema;
  siteName: string;
  liveUrl: string | null;
};

function BrandHeader({
  status,
  liveUrl,
  publishing,
  onPublish,
}: {
  status: string;
  liveUrl: string | null;
  publishing: boolean;
  onPublish: () => void;
}) {
  return (
    <header className="ib-builder-header">
      <div className="ib-brand">
        <span className="ib-brand-mark">
          <Logo size={26} />
        </span>
        <span>
          <span className="ib-wordmark">
            <span className="inferno">Inferno</span>
            <span className="byte">Byte</span>
          </span>
          <span className="ib-brand-sub">Page Designer</span>
        </span>
      </div>
      <div className="ib-builder-actions">
        {status ? <span className="ib-status">{status}</span> : null}
        {liveUrl ? (
          <a
            className="ib-btn ib-btn-ghost"
            href={liveUrl}
            target="_blank"
            rel="noreferrer"
          >
            View site
          </a>
        ) : null}
        <button
          type="button"
          className="ib-btn ib-btn-primary"
          disabled={publishing}
          onClick={onPublish}
        >
          {publishing ? "Publishing…" : "Publish"}
        </button>
      </div>
    </header>
  );
}

export function BuilderEditor() {
  const [schema, setSchema] = useState<SiteBuilderSchema | null>(null);
  const [liveUrl, setLiveUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [publishing, setPublishing] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef<SiteBuilderSchema | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/builder", { cache: "no-store" });
        if (!res.ok) throw new Error("load failed");
        const data = (await res.json()) as LoadedData;
        if (!active) return;
        setSchema(data.draft);
        latest.current = data.draft;
        setLiveUrl(data.liveUrl);
      } catch {
        if (active) {
          setError(
            "Could not load your site. Try reopening the designer from your dashboard.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const persist = useCallback(async (next: SiteBuilderSchema) => {
    const res = await fetch("/api/builder", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ draft: next }),
    });
    setStatus(res.ok ? "Saved" : "Save failed");
  }, []);

  const schedulePersist = useCallback(
    (next: SiteBuilderSchema) => {
      latest.current = next;
      setStatus("Saving…");
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => void persist(next), 800);
    },
    [persist],
  );

  function handleChange(data: Data) {
    if (!schema) return;
    const page = schema.pages[0];
    if (!page) return;
    const updatedPage: SiteBuilderPage = {
      ...page,
      content: {
        content: (data.content ?? []) as SiteBuilderPage["content"]["content"],
        root: { props: data.root?.props ?? {} },
      },
    };
    const next: SiteBuilderSchema = {
      ...schema,
      pages: schema.pages.map((p, i) => (i === 0 ? updatedPage : p)),
    };
    setSchema(next);
    schedulePersist(next);
  }

  async function handlePublish() {
    const current = latest.current;
    if (!current) return;
    setPublishing(true);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    try {
      await persist(current);
      const res = await fetch("/api/builder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "publish" }),
      });
      setStatus(res.ok ? "Published" : "Publish failed");
    } finally {
      setPublishing(false);
    }
  }

  if (loading) {
    return (
      <div className="ib-builder-center">
        <span className="ib-brand-mark">
          <Logo size={28} />
        </span>
        <h1>Loading your designer…</h1>
      </div>
    );
  }

  if (error || !schema || !schema.pages[0]) {
    return (
      <div className="ib-builder-center">
        <span className="ib-brand-mark">
          <Logo size={28} />
        </span>
        <h1>Designer unavailable</h1>
        <p>{error || "No page content was found for this site yet."}</p>
      </div>
    );
  }

  const config = createPuckConfig(schema.theme.primaryColor);
  const page = schema.pages[0];

  return (
    <div className="ib-builder">
      <BrandHeader
        status={status}
        liveUrl={liveUrl}
        publishing={publishing}
        onPublish={handlePublish}
      />
      <div className="ib-builder-canvas site-builder-puck">
        <Puck
          config={config}
          data={page.content as unknown as Data}
          onChange={handleChange}
          iframe={{ enabled: false }}
          overrides={{ header: () => <></> }}
        />
      </div>
    </div>
  );
}
