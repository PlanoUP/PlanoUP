import { NextResponse } from "next/server";
import { verifyEditPassword, EDIT_COOKIE_NAME } from "@/lib/auth/editAuth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    const hash = await verifyEditPassword(typeof password === "string" ? password : "");
    if (!hash) {
      return NextResponse.json({ error: "INVALID_PASSWORD", message: "Senha incorreta." }, { status: 401 });
    }
    const res = NextResponse.json({ ok: true });
    res.cookies.set(EDIT_COOKIE_NAME, hash, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return res;
  } catch (err) {
    console.error("POST /api/auth/login failed", err);
    return NextResponse.json({ error: "INTERNAL_ERROR", message: "Falha ao autenticar." }, { status: 500 });
  }
}
