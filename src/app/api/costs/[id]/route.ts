import { NextResponse } from "next/server";
import { deleteCost, updateCost } from "@/lib/db/costsRepo";
import { isRequestEditor } from "@/lib/auth/editAuth";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  if (!(await isRequestEditor())) {
    return NextResponse.json(
      { error: "UNAUTHORIZED", message: "Desbloqueie o modo de edição para alterar o custo." },
      { status: 401 }
    );
  }
  try {
    const patch = await request.json();
    const cost = await updateCost(params.id, patch);
    if (!cost) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    return NextResponse.json({ cost });
  } catch (err) {
    console.error("PATCH /api/costs/[id] failed", err);
    return NextResponse.json({ error: "INTERNAL_ERROR", message: "Falha ao atualizar o custo." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  if (!(await isRequestEditor())) {
    return NextResponse.json(
      { error: "UNAUTHORIZED", message: "Desbloqueie o modo de edição para excluir o custo." },
      { status: 401 }
    );
  }
  try {
    await deleteCost(params.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/costs/[id] failed", err);
    return NextResponse.json({ error: "INTERNAL_ERROR", message: "Falha ao excluir o custo." }, { status: 500 });
  }
}
