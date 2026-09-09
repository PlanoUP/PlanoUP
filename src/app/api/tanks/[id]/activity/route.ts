import { NextResponse } from "next/server";
import { updateTankActivity } from "@/lib/db/tanksRepo";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const { activityId, edit } = await request.json();
    const tank = await updateTankActivity(params.id, activityId, edit);
    if (!tank) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    return NextResponse.json({ tank });
  } catch (err) {
    console.error("PATCH /api/tanks/[id]/activity failed", err);
    return NextResponse.json({ error: "INTERNAL_ERROR", message: "Falha ao atualizar a atividade." }, { status: 500 });
  }
}
