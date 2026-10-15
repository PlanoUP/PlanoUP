import { NextResponse } from "next/server";
import { updateEquipmentActivity } from "@/lib/db/equipmentRepo";
import { isRequestEditor } from "@/lib/auth/editAuth";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  if (!(await isRequestEditor())) {
    return NextResponse.json(
      { error: "UNAUTHORIZED", message: "Desbloqueie o modo de edição para alterar a atividade." },
      { status: 401 }
    );
  }
  try {
    const { activityId, edit } = await request.json();
    const equipment = await updateEquipmentActivity(params.id, activityId, edit);
    if (!equipment) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    return NextResponse.json({ equipment });
  } catch (err) {
    console.error("PATCH /api/equipment/[id]/activity failed", err);
    return NextResponse.json({ error: "INTERNAL_ERROR", message: "Falha ao atualizar a atividade." }, { status: 500 });
  }
}
