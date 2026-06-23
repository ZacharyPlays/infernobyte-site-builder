import type { PuckComponentData } from "@/lib/schema";
import type React from "react";

type BlockProps = Record<string, unknown> & { primaryColor?: string };

function Navbar({ siteName, links, primaryColor }: BlockProps) {
  const items = String(links || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return (
    <nav style={{ display: "flex", justifyContent: "space-between", padding: "1rem 1.5rem", borderBottom: "1px solid #e5e7eb", background: "#fff" }}>
      <strong style={{ color: primaryColor || "#6366f1" }}>{String(siteName || "Site")}</strong>
      <div style={{ display: "flex", gap: "1rem", fontSize: "0.875rem", color: "#6b7280" }}>
        {items.map((l) => (
          <span key={l}>{l}</span>
        ))}
      </div>
    </nav>
  );
}

function Hero({ title, subtitle, buttonText, buttonLink, imageUrl, primaryColor }: BlockProps) {
  return (
    <section style={{ padding: "4rem 1.5rem", background: "#f9fafb", textAlign: "center" }}>
      {imageUrl ? <img src={String(imageUrl)} alt="" style={{ maxHeight: 192, marginBottom: "2rem", borderRadius: 8 }} /> : null}
      <h1 style={{ fontSize: "2.5rem", fontWeight: 700, marginBottom: "1rem" }}>{String(title || "")}</h1>
      <p style={{ fontSize: "1.125rem", color: "#6b7280", maxWidth: 640, margin: "0 auto 2rem" }}>{String(subtitle || "")}</p>
      {buttonText ? (
        <a href={String(buttonLink || "#")} style={{ display: "inline-block", padding: "0.75rem 1.5rem", background: primaryColor || "#6366f1", color: "#fff", borderRadius: 8, textDecoration: "none" }}>
          {String(buttonText)}
        </a>
      ) : null}
    </section>
  );
}

function Text({ heading, body }: BlockProps) {
  return (
    <section style={{ padding: "3rem 1.5rem", maxWidth: 768, margin: "0 auto" }}>
      {heading ? <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1rem" }}>{String(heading)}</h2> : null}
      <p style={{ color: "#6b7280", whiteSpace: "pre-wrap", lineHeight: 1.7 }}>{String(body || "")}</p>
    </section>
  );
}

function Image({ src, alt, caption }: BlockProps) {
  if (!src) return null;
  return (
    <figure style={{ padding: "2rem 1.5rem", maxWidth: 896, margin: "0 auto" }}>
      <img src={String(src)} alt={String(alt || "")} style={{ width: "100%", borderRadius: 8, maxHeight: 384, objectFit: "cover" }} />
      {caption ? <figcaption style={{ textAlign: "center", fontSize: "0.875rem", color: "#6b7280", marginTop: "0.5rem" }}>{String(caption)}</figcaption> : null}
    </figure>
  );
}

function Features({ heading, item1Title, item1Text, item2Title, item2Text, item3Title, item3Text, primaryColor }: BlockProps) {
  const items = [
    { title: item1Title, text: item1Text },
    { title: item2Title, text: item2Text },
    { title: item3Title, text: item3Text },
  ].filter((i) => i.title);
  return (
    <section style={{ padding: "4rem 1.5rem" }}>
      {heading ? <h2 style={{ textAlign: "center", fontSize: "1.5rem", fontWeight: 700, marginBottom: "2.5rem" }}>{String(heading)}</h2> : null}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "2rem", maxWidth: 1024, margin: "0 auto" }}>
        {items.map((item) => (
          <div key={String(item.title)} style={{ textAlign: "center" }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: primaryColor || "#6366f1", margin: "0 auto 0.75rem" }} />
            <h3 style={{ fontWeight: 600 }}>{String(item.title)}</h3>
            <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>{String(item.text)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Pricing({ heading, plan1Name, plan1Price, plan1Features, plan2Name, plan2Price, plan2Features, primaryColor }: BlockProps) {
  const plans = [
    { name: plan1Name, price: plan1Price, features: plan1Features },
    { name: plan2Name, price: plan2Price, features: plan2Features },
  ].filter((p) => p.name);
  return (
    <section style={{ padding: "4rem 1.5rem", background: "#f9fafb" }}>
      {heading ? <h2 style={{ textAlign: "center", fontSize: "1.5rem", fontWeight: 700, marginBottom: "2.5rem" }}>{String(heading)}</h2> : null}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem", maxWidth: 768, margin: "0 auto" }}>
        {plans.map((plan) => (
          <div key={String(plan.name)} style={{ background: "#fff", borderRadius: 12, padding: "1.5rem", border: "1px solid #e5e7eb" }}>
            <h3 style={{ fontWeight: 700 }}>{String(plan.name)}</h3>
            <p style={{ fontSize: "1.875rem", fontWeight: 700, color: primaryColor || "#6366f1", margin: "0.75rem 0" }}>{String(plan.price)}</p>
            <p style={{ fontSize: "0.875rem", color: "#6b7280", whiteSpace: "pre-wrap" }}>{String(plan.features)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function FAQ({ heading, q1, a1, q2, a2, q3, a3 }: BlockProps) {
  const pairs = [
    { q: q1, a: a1 },
    { q: q2, a: a2 },
    { q: q3, a: a3 },
  ].filter((p) => p.q);
  return (
    <section style={{ padding: "4rem 1.5rem", maxWidth: 640, margin: "0 auto" }}>
      {heading ? <h2 style={{ textAlign: "center", fontSize: "1.5rem", fontWeight: 700, marginBottom: "2rem" }}>{String(heading)}</h2> : null}
      {pairs.map((p) => (
        <div key={String(p.q)} style={{ marginBottom: "1.5rem" }}>
          <dt style={{ fontWeight: 600 }}>{String(p.q)}</dt>
          <dd style={{ color: "#6b7280", marginTop: 4 }}>{String(p.a)}</dd>
        </div>
      ))}
    </section>
  );
}

function CTA({ heading, text, buttonText, buttonLink, primaryColor }: BlockProps) {
  return (
    <section style={{ padding: "4rem 1.5rem", textAlign: "center", background: primaryColor || "#6366f1", color: "#fff" }}>
      <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.75rem" }}>{String(heading)}</h2>
      <p style={{ marginBottom: "1.5rem", opacity: 0.9 }}>{String(text)}</p>
      {buttonText ? (
        <a href={String(buttonLink || "#")} style={{ display: "inline-block", padding: "0.75rem 1.5rem", background: "#fff", color: primaryColor || "#6366f1", borderRadius: 8, textDecoration: "none", fontWeight: 500 }}>
          {String(buttonText)}
        </a>
      ) : null}
    </section>
  );
}

function Contact({ heading, email, phone, address }: BlockProps) {
  return (
    <section style={{ padding: "4rem 1.5rem", maxWidth: 480, margin: "0 auto" }}>
      <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1.5rem" }}>{String(heading)}</h2>
      <ul style={{ listStyle: "none", padding: 0, color: "#6b7280" }}>
        {email ? <li>Email: {String(email)}</li> : null}
        {phone ? <li>Phone: {String(phone)}</li> : null}
        {address ? <li>{String(address)}</li> : null}
      </ul>
    </section>
  );
}

function ProductGrid({ heading, product1Name, product1Price, product1Image, product2Name, product2Price, product2Image, product3Name, product3Price, product3Image, primaryColor }: BlockProps) {
  const products = [
    { name: product1Name, price: product1Price, image: product1Image },
    { name: product2Name, price: product2Price, image: product2Image },
    { name: product3Name, price: product3Price, image: product3Image },
  ].filter((p) => p.name);
  return (
    <section style={{ padding: "4rem 1.5rem" }} id="products">
      {heading ? <h2 style={{ textAlign: "center", fontSize: "1.5rem", fontWeight: 700, marginBottom: "2.5rem" }}>{String(heading)}</h2> : null}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem", maxWidth: 1024, margin: "0 auto" }}>
        {products.map((p) => (
          <div key={String(p.name)} style={{ border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden", background: "#fff" }}>
            {p.image ? (
              <img src={String(p.image)} alt={String(p.name)} style={{ width: "100%", height: 160, objectFit: "cover" }} />
            ) : (
              <div style={{ height: 160, background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: "0.875rem" }}>No image</div>
            )}
            <div style={{ padding: "1rem" }}>
              <h3 style={{ fontWeight: 600 }}>{String(p.name)}</h3>
              <p style={{ fontWeight: 700, color: primaryColor || "#6366f1", marginTop: 4 }}>${String(p.price)}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Footer({ siteName, tagline }: BlockProps) {
  return (
    <footer style={{ padding: "2rem 1.5rem", borderTop: "1px solid #e5e7eb", textAlign: "center", fontSize: "0.875rem", color: "#6b7280", background: "#f9fafb" }}>
      <p style={{ fontWeight: 500, color: "#374151" }}>{String(siteName)}</p>
      {tagline ? <p style={{ marginTop: 4 }}>{String(tagline)}</p> : null}
    </footer>
  );
}

const BLOCKS: Record<string, React.ComponentType<BlockProps>> = {
  Navbar,
  Hero,
  Text,
  Image,
  Features,
  Pricing,
  FAQ,
  CTA,
  Contact,
  ProductGrid,
  Footer,
};

export function RenderPage({
  blocks,
  primaryColor,
}: {
  blocks: PuckComponentData[];
  primaryColor: string;
}) {
  return (
    <>
      {blocks.map((block, i) => {
        const Comp = BLOCKS[block.type];
        if (!Comp) return null;
        return (
          <Comp
            key={`${block.type}-${i}`}
            {...block.props}
            primaryColor={primaryColor}
          />
        );
      })}
    </>
  );
}
