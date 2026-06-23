import { NextRequest, NextResponse } from "next/server";
import { emailEnabled } from "@/lib/schema";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  if (!emailEnabled()) {
    return NextResponse.json({ error: "Email not configured" }, { status: 404 });
  }
  const body = await req.json().catch(() => ({}));
  const to = String(body.to || "").trim();
  const subject = String(body.subject || "Message from your site").trim();
  const message = String(body.message || "").trim();
  if (!to || !message) {
    return NextResponse.json({ error: "Recipient and message required" }, { status: 400 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY!);
  const from = process.env.FROM_EMAIL!.trim();
  const { error } = await resend.emails.send({
    from,
    to,
    subject,
    text: message,
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
