"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Puck, type Data } from "@measured/puck";
import { createPuckConfig } from "@/lib/puck-config";
import type { SiteBuilderSchema, SiteBuilderPage } from "@/lib/schema";
import {
  OnSiteSetupWizard,
  type Addons,
  type SetupSavePayload,
} from "@/components/OnSiteSetup";
import Logo from "@/components/Logo";

type ThemeOption = { id: string; label: string };

type LoadedData = {
  draft: SiteBuilderSchema;
  siteName: string;
  liveUrl: string | null;
  setupComplete: boolean;
  themeId: string;
  themes: ThemeOption[];
  addons: Addons;
};

const DEFAULT_THEMES: ThemeOption[] = [
  { id: "business", label: "Business" },
  { id: "portfolio", label: "Portfolio" },
  { id: "store", label: "Store" },
];

function toAddons(raw: unknown): Addons {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const str = (v: unknown) => (typeof v === "string" ? v : undefined);
  return {
    auth: Boolean(o.auth),
    payments: Boolean(o.payments),
    email: Boolean(o.email),
    redis: Boolean(o.redis),
    adminEmail: str(o.adminEmail),
    squareApplicationId: str(o.squareApplicationId),
    squareAccessToken: str(o.squareAccessToken),
    squareLocationId: str(o.squareLocationId),
    resendApiKey: str(o.resendApiKey),
    fromEmail: str(o.fromEmail),
  };
}

function BrandBar({
  children,
}: {
  children?: React.ReactNode;
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
      <div className="ib-builder-actions">{children}</div>
    </header>
  );
}

export function BuilderEditor() {
  const [data, setData] = useState<LoadedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [publishing, setPublishing] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef<SiteBuilderSchema | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/builder", { cache: "no-store" });
    if (!res.ok) throw new Error("load failed");
    const json = (await res.json()) as {
      draft: SiteBuilderSchema;
      siteName: string;
      liveUrl: string | null;
      setupComplete: boolean;
      themeId: string;
      themes: ThemeOption[];
      addons: unknown;
    };
    const loaded: LoadedData = {
      draft: json.draft,
      siteName: json.siteName,
      liveUrl: json.liveUrl,
      setupComplete: json.setupComplete,
      themeId: json.themeId || "business",
      themes: json.themes?.length ? json.themes : DEFAULT_THEMES,
      addons: toAddons(json.addons),
    };
    latest.current = loaded.draft;
    setData(loaded);
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        await load();
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
  }, [load]);

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

  function handleChange(puckData: Data) {
    setData((prev) => {
      if (!prev) return prev;
      const page = prev.draft.pages[0];
      if (!page) return prev;
      const updatedPage: SiteBuilderPage = {
        ...page,
        content: {
          content: (puckData.content ??
            []) as SiteBuilderPage["content"]["content"],
          root: { props: puckData.root?.props ?? {} },
        },
      };
      const nextDraft: SiteBuilderSchema = {
        ...prev.draft,
        pages: prev.draft.pages.map((p, i) => (i === 0 ? updatedPage : p)),
      };
      schedulePersist(nextDraft);
      return { ...prev, draft: nextDraft };
    });
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

  const saveSetup = useCallback(
    async (payload: SetupSavePayload) => {
      const res = await fetch("/api/builder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) return { ok: false, error: json.error };
      return { ok: true };
    },
    [],
  );

  const finishSetup = useCallback(() => {
    setLoading(true);
    load()
      .catch(() =>
        setError("Setup saved, but reloading the designer failed. Refresh the page."),
      )
      .finally(() => setLoading(false));
  }, [load]);

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

  if (error || !data) {
    return (
      <div className="ib-builder-center">
        <span className="ib-brand-mark">
          <Logo size={28} />
        </span>
        <h1>Designer unavailable</h1>
        <p>{error || "Something went wrong loading your site."}</p>
      </div>
    );
  }

  // Setup phase — runs inside the authenticated builder, not on the public site.
  if (!data.setupComplete) {
    return (
      <div className="ib-builder">
        <BrandBar />
        <div className="ib-builder-canvas">
          <OnSiteSetupWizard
            initialThemeId={data.themeId}
            initialAddons={data.addons}
            themes={data.themes}
            onSave={saveSetup}
            onComplete={finishSetup}
          />
        </div>
      </div>
    );
  }

  if (!data.draft.pages[0]) {
    return (
      <div className="ib-builder-center">
        <span className="ib-brand-mark">
          <Logo size={28} />
        </span>
        <h1>No page to edit yet</h1>
        <p>Your site has no pages. Re-run setup from your dashboard.</p>
      </div>
    );
  }

  const config = createPuckConfig(data.draft.theme.primaryColor);
  const page = data.draft.pages[0];

  return (
    <div className="ib-builder">
      <BrandBar>
        {status ? <span className="ib-status">{status}</span> : null}
        {data.liveUrl ? (
          <a
            className="ib-btn ib-btn-ghost"
            href={data.liveUrl}
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
          onClick={handlePublish}
        >
          {publishing ? "Publishing…" : "Publish"}
        </button>
      </BrandBar>
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
