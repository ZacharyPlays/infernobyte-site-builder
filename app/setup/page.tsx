import { fetchSiteConfig, fetchSiteStatus, isPreviewMode } from "@/lib/panel-client";
import { OnSiteSetupWizard, BuildingScreen } from "@/components/OnSiteSetup";
import { redirect } from "next/navigation";

export default async function SetupPage() {
  if (isPreviewMode()) {
    redirect("/");
  }

  const status = await fetchSiteStatus();
  if (status && !status.siteLive) {
    return <BuildingScreen status={status.deploymentStatus} />;
  }

  const config = await fetchSiteConfig();
  if (!config) {
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
      themes={config.themes}
      designerUrl={config.designerUrl}
    />
  );
}
