import {
  fetchSiteConfigDetailed,
  fetchSiteStatusDetailed,
  isPreviewMode,
  panelConnectionErrorMessage,
} from "@/lib/panel-client";
import { OnSiteSetupWizard, BuildingScreen } from "@/components/OnSiteSetup";
import { redirect } from "next/navigation";

// Must render per-request: credentials live in the container's runtime env, which
// is empty at build time. Static prerendering would bake a "missing_config" page.
export const dynamic = "force-dynamic";

const DEFAULT_THEMES = [
  { id: "business", label: "Business" },
  { id: "portfolio", label: "Portfolio" },
  { id: "store", label: "Store" },
];

export default async function SetupPage() {
  if (isPreviewMode()) {
    redirect("/");
  }

  const { status, error: statusError } = await fetchSiteStatusDetailed();
  if (status && !status.siteLive) {
    return <BuildingScreen status={status.deploymentStatus} />;
  }

  const { config, error: configError } = await fetchSiteConfigDetailed();
  if (!config) {
    const reason = panelConnectionErrorMessage(configError || statusError);
    if (reason === "missing_config" || reason === "missing_panel_url") {
      return <BuildingScreen status={reason} />;
    }
    if (reason === "auth_failed") {
      return <BuildingScreen status="auth_failed" />;
    }
    return <BuildingScreen status="connecting" />;
  }

  if (config.setupComplete) {
    if (config.designerUrl) {
      redirect(config.designerUrl);
    }
    redirect("/");
  }

  const addons = config.addons as {
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

  return (
    <OnSiteSetupWizard
      initialThemeId={config.themeId}
      initialAddons={addons}
      themes={config.themes.length > 0 ? config.themes : DEFAULT_THEMES}
      designerUrl={config.designerUrl}
    />
  );
}
