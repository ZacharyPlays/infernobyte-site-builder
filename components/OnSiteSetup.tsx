"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type ThemeOption = { id: string; label: string };

type Addons = {
  auth: boolean;
  payments: boolean;
  email: boolean;
  redis: boolean;
  adminEmail?: string;
  squareApplicationId?: string;
  squareAccessToken?: string;
  squareLocationId?: string;
  resendApiKey?: string;
  fromEmail?: string;
};

const STEPS = ["theme", "auth", "payments", "email", "redis", "done"] as const;
type Step = (typeof STEPS)[number];

const STEP_LABELS: Record<Step, string> = {
  theme: "Theme",
  auth: "Login",
  payments: "Payments",
  email: "Email",
  redis: "Redis",
  done: "Finish",
};

export function OnSiteSetupWizard({
  initialThemeId,
  initialAddons,
  themes,
  designerUrl,
}: {
  initialThemeId: string;
  initialAddons: Addons;
  themes: ThemeOption[];
  designerUrl: string | null;
}) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("theme");
  const [theme, setTheme] = useState(initialThemeId || "business");
  const [addons, setAddons] = useState<Addons>(initialAddons);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function finish() {
    setBusy(true);
    setError("");
    const res = await fetch("/api/site-setup", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ themeId: theme, addons, completeSetup: true }),
    });
    const json = (await res.json().catch(() => ({}))) as { error?: string };
    setBusy(false);
    if (!res.ok) {
      setError(json.error || "Could not save setup");
      return;
    }
    if (designerUrl) {
      window.location.href = designerUrl;
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="setup-shell">
      <div className="setup-card">
        <header className="setup-header">
          <p className="setup-kicker">Welcome</p>
          <h1>Set up your website</h1>
          <p className="setup-sub">
            Pick a starter theme and turn on optional features. You can change
            everything later.
          </p>
        </header>

        <div className="setup-steps">
          {STEPS.map((s, i) => (
            <span
              key={s}
              className={`setup-step ${s === step ? "active" : STEPS.indexOf(step) > i ? "done" : ""}`}
            >
              {STEP_LABELS[s]}
            </span>
          ))}
        </div>

        {step === "theme" && (
          <div className="setup-grid">
            {themes.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`theme-card ${theme === t.id ? "selected" : ""}`}
                onClick={() => setTheme(t.id)}
              >
                <strong>{t.label}</strong>
              </button>
            ))}
          </div>
        )}

        {step === "auth" && (
          <div className="setup-section">
            <label className="check-row">
              <input
                type="checkbox"
                checked={addons.auth}
                onChange={(e) => setAddons({ ...addons, auth: e.target.checked })}
              />
              <span>Let visitors log in (your email becomes admin)</span>
            </label>
            {addons.auth ? (
              <input
                className="setup-input"
                type="email"
                placeholder="Admin email"
                value={addons.adminEmail || ""}
                onChange={(e) => setAddons({ ...addons, adminEmail: e.target.value })}
              />
            ) : null}
          </div>
        )}

        {step === "payments" && (
          <div className="setup-section">
            <label className="check-row">
              <input
                type="checkbox"
                checked={addons.payments}
                onChange={(e) => setAddons({ ...addons, payments: e.target.checked })}
              />
              <span>Accept payments with Square</span>
            </label>
            {addons.payments ? (
              <div className="setup-fields">
                <input
                  className="setup-input"
                  placeholder="Square Application ID"
                  value={addons.squareApplicationId || ""}
                  onChange={(e) =>
                    setAddons({ ...addons, squareApplicationId: e.target.value })
                  }
                />
                <input
                  className="setup-input"
                  type="password"
                  placeholder="Square Access Token"
                  value={addons.squareAccessToken || ""}
                  onChange={(e) =>
                    setAddons({ ...addons, squareAccessToken: e.target.value })
                  }
                />
                <input
                  className="setup-input"
                  placeholder="Square Location ID"
                  value={addons.squareLocationId || ""}
                  onChange={(e) =>
                    setAddons({ ...addons, squareLocationId: e.target.value })
                  }
                />
              </div>
            ) : null}
          </div>
        )}

        {step === "email" && (
          <div className="setup-section">
            <label className="check-row">
              <input
                type="checkbox"
                checked={addons.email}
                onChange={(e) => setAddons({ ...addons, email: e.target.checked })}
              />
              <span>Send email with Resend</span>
            </label>
            {addons.email ? (
              <div className="setup-fields">
                <input
                  className="setup-input"
                  type="password"
                  placeholder="Resend API key"
                  value={addons.resendApiKey || ""}
                  onChange={(e) => setAddons({ ...addons, resendApiKey: e.target.value })}
                />
                <input
                  className="setup-input"
                  placeholder="From address"
                  value={addons.fromEmail || ""}
                  onChange={(e) => setAddons({ ...addons, fromEmail: e.target.value })}
                />
              </div>
            ) : null}
          </div>
        )}

        {step === "redis" && (
          <div className="setup-section">
            <label className="check-row">
              <input
                type="checkbox"
                checked={addons.redis}
                onChange={(e) => setAddons({ ...addons, redis: e.target.checked })}
              />
              <span>Enable Redis caching (optional)</span>
            </label>
          </div>
        )}

        {step === "done" && (
          <div className="setup-done">
            <h2>You&apos;re all set!</h2>
            <p>Open the designer to customize your pages, then publish when ready.</p>
          </div>
        )}

        {error ? <p className="setup-error">{error}</p> : null}

        <footer className="setup-footer">
          <button
            type="button"
            className="btn-ghost"
            onClick={() => {
              if (designerUrl) window.location.href = designerUrl;
              else router.push("/");
            }}
          >
            Skip for now
          </button>
          <div className="setup-nav">
            {step !== "theme" ? (
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  const i = STEPS.indexOf(step);
                  if (i > 0) setStep(STEPS[i - 1]);
                }}
              >
                Back
              </button>
            ) : null}
            {step === "done" ? (
              <button type="button" className="btn-primary" disabled={busy} onClick={() => void finish()}>
                {busy ? "Saving…" : "Start designing"}
              </button>
            ) : (
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  const i = STEPS.indexOf(step);
                  if (i < STEPS.length - 1) setStep(STEPS[i + 1]);
                }}
              >
                Continue
              </button>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}

export function BuildingScreen({ status }: { status: string | null }) {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const id = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "" : d + "."));
    }, 500);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      window.location.reload();
    }, 8000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="setup-shell">
      <div className="setup-card building-card">
        <div className="building-spinner" aria-hidden />
        <h1>Your site is starting up{dots}</h1>
        <p className="setup-sub">
          We&apos;re building your hosting environment. This usually takes a few
          minutes. This page will refresh automatically.
        </p>
        {status ? (
          <p className="setup-meta">Status: {status}</p>
        ) : null}
      </div>
    </div>
  );
}
