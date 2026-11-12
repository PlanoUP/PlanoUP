import { NextResponse } from "next/server";
import { FIELD_COOKIE_NAME } from "@/lib/auth/fieldAuth";

export const dynamic = "force-dynamic";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(FIELD_COOKIE_NAME, "", { path: "/", maxAge: 0 });
  return res;
}
