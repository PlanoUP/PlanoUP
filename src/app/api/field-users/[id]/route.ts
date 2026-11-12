import { NextResponse } from "next/server";
import { setFieldUserActive, setFieldUserPassword } from "@/lib/db/fieldUsersRepo";
import { isRequestEditor } from "@/lib/auth/editAuth";
import { toPublicFieldUser } from "@/lib/brava/field/types";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  if (!(await isRequestEditor())) {
    return NextResponse.json({ error: "UNAUTHORIZED", message: "Desbloqueie o modo de edição para alterar o usuário." }, { status: 401 });
  }
  try {
    const body = await request.json();
    let user = null;
    if (typeof body.active === "boolean") {
      user = await setFieldUserActive(params.id, body.active);
    }
    if (typeof body.password === "string" && body.password.length > 0) {
      if (body.password.length < 4) {
        return NextResponse.json({ error: "INVALID_INPUT", message: "Senha deve ter ao menos 4 caracteres." }, { status: 400 });
      }
      user = await setFieldUserPassword(params.id, body.password);
    }
    if (!user) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    return NextResponse.json({ user: toPublicFieldUser(user) });
  } catch (err) {
    console.error("PATCH /api/field-users/[id] failed", err);
    return NextResponse.json({ error: "INTERNAL_ERROR", message: "Falha ao atualizar o usuário." }, { status: 500 });
  }
}
