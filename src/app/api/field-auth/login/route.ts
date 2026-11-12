import { NextResponse } from "next/server";
import { verifyFieldLogin, fieldCookieValue, FIELD_COOKIE_NAME } from "@/lib/auth/fieldAuth";
import { toPublicFieldUser } from "@/lib/brava/field/types";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    const user = await verifyFieldLogin(typeof username === "string" ? username : "", typeof password === "string" ? password : "");
    if (!user) {
      return NextResponse.json({ error: "INVALID_LOGIN", message: "Usuário ou senha incorretos." }, { status: 401 });
    }
    const res = NextResponse.json({ user: toPublicFieldUser(user) });
    res.cookies.set(FIELD_COOKIE_NAME, fieldCookieValue(user), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return res;
  } catch (err) {
    console.error("POST /api/field-auth/login failed", err);
    return NextResponse.json({ error: "INTERNAL_ERROR", message: "Falha ao autenticar." }, { status: 500 });
  }
}
