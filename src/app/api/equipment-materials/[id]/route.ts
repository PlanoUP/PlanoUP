import { NextResponse } from "next/server";
import { deleteEquipmentMaterial, updateEquipmentMaterial } from "@/lib/db/equipmentMaterialsRepo";
import { isRequestEditor } from "@/lib/auth/editAuth";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  if (!(await isRequestEditor())) {
    return NextResponse.json(
      { error: "UNAUTHORIZED", message: "Desbloqueie o modo de edição para alterar o material." },
      { status: 401 }
    );
  }
  try {
    const patch = await request.json();
    const material = await updateEquipmentMaterial(params.id, patch);
    if (!material) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    return NextResponse.json({ material });
  } catch (err) {
    console.error("PATCH /api/equipment-materials/[id] failed", err);
    return NextResponse.json({ error: "INTERNAL_ERROR", message: "Falha ao atualizar o material." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  if (!(await isRequestEditor())) {
    return NextResponse.json(
      { error: "UNAUTHORIZED", message: "Desbloqueie o modo de edição para excluir o material." },
      { status: 401 }
    );
  }
  try {
    await deleteEquipmentMaterial(params.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/equipment-materials/[id] failed", err);
    return NextResponse.json({ error: "INTERNAL_ERROR", message: "Falha ao excluir o material." }, { status: 500 });
  }
}
