import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

// Setup now lives inside the authenticated builder. /setup is kept only as a
// funnel: visitors land on /builder (which gates on the builder cookie and, if
// they aren't authenticated, points them to the InfernoByte dashboard).
export default function SetupPage() {
  redirect("/builder");
}
