import { NextResponse } from "next/server";
import { deleteEquipmentCost, updateEquipmentCost } from "@/lib/db/equipmentCostsRepo";
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
    const cost = await updateEquipmentCost(params.id, patch);
    if (!cost) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    return NextResponse.json({ cost });
  } catch (err) {
    console.error("PATCH /api/equipment-costs/[id] failed", err);
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
    await deleteEquipmentCost(params.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/equipment-costs/[id] failed", err);
    return NextResponse.json({ error: "INTERNAL_ERROR", message: "Falha ao excluir o custo." }, { status: 500 });
  }
}
