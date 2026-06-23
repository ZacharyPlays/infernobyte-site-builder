import { redirect } from "next/navigation";
import { builderConfigured, hasBuilderSession } from "@/lib/builder-auth";
import Logo from "@/components/Logo";
import { BuilderEditor } from "./BuilderEditor";
import "@measured/puck/puck.css";
import "./builder.css";

export const dynamic = "force-dynamic";

export default async function BuilderPage() {
  if (!builderConfigured()) {
    return (
      <div className="ib-builder-center">
        <span className="ib-brand-mark">
          <Logo size={28} />
        </span>
        <h1>Connecting to InfernoByte…</h1>
        <p>
          Your site is still finishing setup. Once hosting is ready, open the
          designer again from your InfernoByte dashboard.
        </p>
      </div>
    );
  }

  if (!(await hasBuilderSession())) {
    redirect("/builder/denied");
  }

  return <BuilderEditor />;
}
