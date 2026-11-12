import { NextResponse } from "next/server";
import { listFieldUsers, createFieldUser } from "@/lib/db/fieldUsersRepo";
import { isRequestEditor } from "@/lib/auth/editAuth";
import { toPublicFieldUser } from "@/lib/brava/field/types";

export const dynamic = "force-dynamic";

/** Managing Fiscal accounts is an administrative action — gated by the same shared editor password as every other admin action in this app, never by a Fiscal's own login. */
export async function GET() {
  if (!(await isRequestEditor())) {
    return NextResponse.json({ error: "UNAUTHORIZED", message: "Desbloqueie o modo de edição para ver os usuários." }, { status: 401 });
  }
  try {
    const users = await listFieldUsers();
    return NextResponse.json({ users: users.map(toPublicFieldUser) });
  } catch (err) {
    console.error("GET /api/field-users failed", err);
    return NextResponse.json({ error: "INTERNAL_ERROR", message: "Falha ao consultar os usuários." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await isRequestEditor())) {
    return NextResponse.json({ error: "UNAUTHORIZED", message: "Desbloqueie o modo de edição para cadastrar um usuário." }, { status: 401 });
  }
  try {
    const { name, username, password } = await request.json();
    if (!name?.trim() || !username?.trim() || !password || password.length < 4) {
      return NextResponse.json(
        { error: "INVALID_INPUT", message: "Nome, usuário e senha (mín. 4 caracteres) são obrigatórios." },
        { status: 400 }
      );
    }
    const user = await createFieldUser({ name, username, password });
    return NextResponse.json({ user: toPublicFieldUser(user) }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message === "USERNAME_TAKEN") {
      return NextResponse.json({ error: "USERNAME_TAKEN", message: "Esse usuário já está em uso." }, { status: 409 });
    }
    console.error("POST /api/field-users failed", err);
    return NextResponse.json({ error: "INTERNAL_ERROR", message: "Falha ao cadastrar o usuário." }, { status: 500 });
  }
}
