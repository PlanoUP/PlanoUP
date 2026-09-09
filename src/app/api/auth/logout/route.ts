import { NextResponse } from "next/server";
import { EDIT_COOKIE_NAME } from "@/lib/auth/editAuth";

export const dynamic = "force-dynamic";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(EDIT_COOKIE_NAME, "", { path: "/", maxAge: 0 });
  return res;
}
