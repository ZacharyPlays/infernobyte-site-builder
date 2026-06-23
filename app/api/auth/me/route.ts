import { NextResponse } from "next/server";
import { getSession, authEnabled } from "@/lib/auth";

export async function GET() {
  if (!authEnabled()) {
    return NextResponse.json({ enabled: false });
  }
  const session = await getSession();
  if (!session) return NextResponse.json({ enabled: true, user: null });
  return NextResponse.json({
    enabled: true,
    user: { email: session.email, role: session.role },
  });
}
