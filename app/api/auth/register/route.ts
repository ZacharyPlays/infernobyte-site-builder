import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb, ensureIndexes, type SiteUser } from "@/lib/mongodb";
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

  await ensureIndexes();
  const db = await getDb();
  if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase() || "";
  const existing = await db.collection<SiteUser>("users").findOne({ email });
  if (existing) {
    return NextResponse.json({ error: "Account already exists" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const role = email === adminEmail ? "admin" : "user";
  const doc: SiteUser = { email, passwordHash, role, createdAt: new Date() };
  const result = await db.collection<SiteUser>("users").insertOne(doc);

  const token = await signToken({ sub: String(result.insertedId), email, role });
  if (!token) return NextResponse.json({ error: "Auth misconfigured" }, { status: 500 });
  await setSessionCookie(token);
  return NextResponse.json({ ok: true, role });
}
