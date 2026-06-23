import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb, type SiteUser } from "@/lib/mongodb";
import { signToken, setSessionCookie, authEnabled } from "@/lib/auth";

export async function POST(req: NextRequest) {
  if (!authEnabled()) {
    return NextResponse.json({ error: "Auth not enabled" }, { status: 404 });
  }
  const body = await req.json().catch(() => ({}));
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }

  const db = await getDb();
  if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  const user = await db.collection<SiteUser>("users").findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase() || "";
  const role = email === adminEmail ? "admin" : user.role;

  const token = await signToken({ sub: String(user._id), email, role });
  if (!token) return NextResponse.json({ error: "Auth misconfigured" }, { status: 500 });
  await setSessionCookie(token);
  return NextResponse.json({ ok: true, role });
}
