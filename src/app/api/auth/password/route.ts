import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  EDIT_COOKIE_NAME,
  EDIT_PASSWORD_KEY,
  hashPassword,
  isEditCookieValid,
  verifyEditPassword,
} from "@/lib/auth/editAuth";
import { setSetting } from "@/lib/db/settingsRepo";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const token = cookies().get(EDIT_COOKIE_NAME)?.value;
    if (!(await isEditCookieValid(token))) {
      return NextResponse.json(
        { error: "UNAUTHORIZED", message: "Desbloqueie o modo de edição antes de trocar a senha." },
        { status: 401 }
      );
    }

    const { currentPassword, newPassword } = await request.json();
    const hash = await verifyEditPassword(typeof currentPassword === "string" ? currentPassword : "");
    if (!hash) {
      return NextResponse.json({ error: "INVALID_PASSWORD", message: "Senha atual incorreta." }, { status: 401 });
    }
    if (typeof newPassword !== "string" || newPassword.length < 4) {
      return NextResponse.json(
        { error: "WEAK_PASSWORD", message: "A nova senha precisa ter ao menos 4 caracteres." },
        { status: 400 }
      );
    }

    const newHash = hashPassword(newPassword);
    await setSetting(EDIT_PASSWORD_KEY, newHash);

    const res = NextResponse.json({ ok: true });
    res.cookies.set(EDIT_COOKIE_NAME, newHash, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return res;
  } catch (err) {
    console.error("POST /api/auth/password failed", err);
    return NextResponse.json({ error: "INTERNAL_ERROR", message: "Falha ao trocar a senha." }, { status: 500 });
  }
}
