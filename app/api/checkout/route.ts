import { NextRequest, NextResponse } from "next/server";
import { paymentsEnabled } from "@/lib/schema";

/** Create a Square payment link for a product amount (cents). */
export async function POST(req: NextRequest) {
  if (!paymentsEnabled()) {
    return NextResponse.json({ error: "Payments not configured" }, { status: 404 });
  }
  const body = await req.json().catch(() => ({}));
  const amountCents = Math.round(Number(body.amountCents) || 0);
  const name = String(body.name || "Purchase").trim();
  if (amountCents < 100) {
    return NextResponse.json({ error: "Minimum amount is $1.00" }, { status: 400 });
  }

  const token = process.env.SQUARE_ACCESS_TOKEN!.trim();
  const locationId = process.env.SQUARE_LOCATION_ID!.trim();
  const base =
    process.env.SQUARE_ENV === "production"
      ? "https://connect.squareup.com"
      : "https://connect.squareupsandbox.com";

  const res = await fetch(`${base}/v2/online-checkout/payment-links`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "Square-Version": "2024-11-20",
    },
    body: JSON.stringify({
      idempotency_key: crypto.randomUUID(),
      quick_pay: {
        name,
        price_money: { amount: amountCents, currency: "USD" },
        location_id: locationId,
      },
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return NextResponse.json(
      { error: data.errors?.[0]?.detail || "Square error" },
      { status: 502 },
    );
  }
  const url = data.payment_link?.url;
  if (!url) {
    return NextResponse.json({ error: "No payment URL returned" }, { status: 502 });
  }
  return NextResponse.json({ url });
}
