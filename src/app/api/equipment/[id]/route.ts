import { NextResponse } from "next/server";
import { updateEquipmentMeta } from "@/lib/db/equipmentRepo";
import { isRequestEditor } from "@/lib/auth/editAuth";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  if (!(await isRequestEditor())) {
    return NextResponse.json(
      { error: "UNAUTHORIZED", message: "Desbloqueie o modo de edição para alterar o equipamento." },
      { status: 401 }
    );
  }
  try {
    const patch = await request.json();
    const equipment = await updateEquipmentMeta(params.id, patch);
    if (!equipment) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    return NextResponse.json({ equipment });
  } catch (err) {
    console.error("PATCH /api/equipment/[id] failed", err);
    return NextResponse.json({ error: "INTERNAL_ERROR", message: "Falha ao atualizar o equipamento." }, { status: 500 });
  }
}
