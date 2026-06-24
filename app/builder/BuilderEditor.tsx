"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  BLOCK_MAP,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  blocksByCategory,
  createBlock,
  type BlockField,
} from "@/lib/block-registry";
import { BLOCKS } from "@/lib/blocks";
import type {
  PuckComponentData,
  SiteBuilderSchema,
  SiteBuilderPage,
} from "@/lib/schema";
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

function BuilderHeader({ children }: { children?: React.ReactNode }) {
  return (
    <header className="ib-builder-header">
      <div className="ib-brand">
        <span className="ib-brand-mark">
          <Logo size={24} />
        </span>
        <span className="ib-brand-text">
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
  const [selected, setSelected] = useState<number | null>(null);
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

  // Update the first page's block list and schedule an autosave.
  const updateBlocks = useCallback(
    (updater: (blocks: PuckComponentData[]) => PuckComponentData[]) => {
      setData((prev) => {
        if (!prev) return prev;
        const page = prev.draft.pages[0];
        if (!page) return prev;
        const nextBlocks = updater(page.content.content);
        const updatedPage: SiteBuilderPage = {
          ...page,
          content: { ...page.content, content: nextBlocks },
        };
        const nextDraft: SiteBuilderSchema = {
          ...prev.draft,
          pages: prev.draft.pages.map((p, i) => (i === 0 ? updatedPage : p)),
        };
        schedulePersist(nextDraft);
        return { ...prev, draft: nextDraft };
      });
    },
    [schedulePersist],
  );

  const addBlock = useCallback(
    (type: string) => {
      const block = createBlock(type);
      if (!block) return;
      // latest.current mirrors the live draft, so its length is the index the
      // appended block will land on.
      const newIndex = latest.current?.pages[0]?.content.content.length ?? 0;
      updateBlocks((blocks) => [...blocks, block]);
      setSelected(newIndex);
    },
    [updateBlocks],
  );

  const updateProp = useCallback(
    (index: number, name: string, value: string) => {
      updateBlocks((blocks) =>
        blocks.map((b, i) =>
          i === index ? { ...b, props: { ...b.props, [name]: value } } : b,
        ),
      );
    },
    [updateBlocks],
  );

  const moveBlock = useCallback(
    (index: number, dir: -1 | 1) => {
      const target = index + dir;
      updateBlocks((blocks) => {
        if (target < 0 || target >= blocks.length) return blocks;
        const next = [...blocks];
        [next[index], next[target]] = [next[target], next[index]];
        return next;
      });
      setSelected((cur) => {
        if (cur !== index) return cur;
        if (target < 0) return cur;
        return target;
      });
    },
    [updateBlocks],
  );

  const removeBlock = useCallback(
    (index: number) => {
      updateBlocks((blocks) => blocks.filter((_, i) => i !== index));
      setSelected((cur) => {
        if (cur === null) return cur;
        if (cur === index) return null;
        return cur > index ? cur - 1 : cur;
      });
    },
    [updateBlocks],
  );

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

  const saveSetup = useCallback(async (payload: SetupSavePayload) => {
    const res = await fetch("/api/builder", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) return { ok: false, error: json.error };
    return { ok: true };
  }, []);

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

  // Setup phase — runs inside the authenticated builder, no header on top so the
  // compact wizard fills the viewport without scrolling.
  if (!data.setupComplete) {
    return (
      <OnSiteSetupWizard
        initialThemeId={data.themeId}
        initialAddons={data.addons}
        themes={data.themes}
        onSave={saveSetup}
        onComplete={finishSetup}
      />
    );
  }

  const page = data.draft.pages[0];
  if (!page) {
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

  const primaryColor = data.draft.theme.primaryColor || "#ef4444";
  const blocks = page.content.content;
  const grouped = blocksByCategory();
  const selectedBlock = selected !== null ? blocks[selected] : undefined;
  const selectedDef = selectedBlock ? BLOCK_MAP[selectedBlock.type] : undefined;

  return (
    <div className="ib-builder">
      <BuilderHeader>
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
      </BuilderHeader>

      <div className="ib-builder-body">
        {/* Left: block palette */}
        <aside className="ib-panel ib-palette">
          <p className="ib-panel-title">Add blocks</p>
          {CATEGORY_ORDER.map((cat) =>
            grouped[cat].length ? (
              <div key={cat} className="ib-palette-group">
                <p className="ib-palette-label">{CATEGORY_LABELS[cat]}</p>
                <div className="ib-palette-items">
                  {grouped[cat].map((def) => (
                    <button
                      key={def.type}
                      type="button"
                      className="ib-palette-item"
                      onClick={() => addBlock(def.type)}
                    >
                      <span className="ib-plus">+</span>
                      {def.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : null,
          )}
        </aside>

        {/* Center: live preview */}
        <main className="ib-preview-wrap">
          <div className="ib-preview-frame">
            {blocks.length === 0 ? (
              <div className="ib-preview-empty">
                <h2>Your page is empty</h2>
                <p>Add a block from the left to start designing.</p>
              </div>
            ) : (
              blocks.map((block, i) => {
                const Comp = BLOCKS[block.type];
                const isSelected = selected === i;
                return (
                  <div
                    key={`${block.type}-${i}`}
                    className={`ib-block${isSelected ? " selected" : ""}`}
                    onClick={() => setSelected(i)}
                  >
                    <span className="ib-block-tag">
                      {BLOCK_MAP[block.type]?.label || block.type}
                    </span>
                    <div className="ib-block-tools">
                      <button
                        type="button"
                        title="Move up"
                        disabled={i === 0}
                        onClick={(e) => {
                          e.stopPropagation();
                          moveBlock(i, -1);
                        }}
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        title="Move down"
                        disabled={i === blocks.length - 1}
                        onClick={(e) => {
                          e.stopPropagation();
                          moveBlock(i, 1);
                        }}
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        title="Delete"
                        className="danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeBlock(i);
                        }}
                      >
                        ✕
                      </button>
                    </div>
                    <div className="ib-block-render">
                      {Comp ? (
                        <Comp {...block.props} primaryColor={primaryColor} />
                      ) : (
                        <div className="ib-block-unknown">
                          Unknown block: {block.type}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </main>

        {/* Right: inspector */}
        <aside className="ib-panel ib-inspector">
          {selectedBlock && selectedDef ? (
            <>
              <p className="ib-panel-title">{selectedDef.label}</p>
              <div className="ib-fields">
                {selectedDef.fields.map((field: BlockField) => {
                  const value = String(selectedBlock.props[field.name] ?? "");
                  return (
                    <label key={field.name} className="ib-field">
                      <span className="ib-field-label">{field.label}</span>
                      {field.type === "textarea" ? (
                        <textarea
                          className="ib-input"
                          rows={3}
                          value={value}
                          onChange={(e) =>
                            updateProp(selected!, field.name, e.target.value)
                          }
                        />
                      ) : (
                        <input
                          className="ib-input"
                          type="text"
                          value={value}
                          onChange={(e) =>
                            updateProp(selected!, field.name, e.target.value)
                          }
                        />
                      )}
                    </label>
                  );
                })}
              </div>
              <button
                type="button"
                className="ib-btn ib-btn-ghost ib-delete-btn"
                onClick={() => removeBlock(selected!)}
              >
                Delete block
              </button>
            </>
          ) : (
            <div className="ib-inspector-empty">
              <p className="ib-panel-title">Inspector</p>
              <p className="ib-muted">
                Select a block in the preview to edit its content.
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
