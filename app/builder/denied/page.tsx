import Logo from "@/components/Logo";
import "../builder.css";

export const dynamic = "force-dynamic";

export default function BuilderDeniedPage() {
  return (
    <div className="ib-builder-center">
      <span className="ib-brand-mark">
        <Logo size={28} />
      </span>
      <h1>Open the designer from your dashboard</h1>
      <p>
        For your security, the page designer can only be opened from your
        InfernoByte dashboard. Head to your service and click{" "}
        <strong>Open page designer</strong>.
      </p>
    </div>
  );
}
