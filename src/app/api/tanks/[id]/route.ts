import { NextResponse } from "next/server";
import { updateTankMeta } from "@/lib/db/tanksRepo";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const patch = await request.json();
    const tank = await updateTankMeta(params.id, patch);
    if (!tank) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    return NextResponse.json({ tank });
  } catch (err) {
    console.error("PATCH /api/tanks/[id] failed", err);
    return NextResponse.json({ error: "INTERNAL_ERROR", message: "Falha ao atualizar o tanque." }, { status: 500 });
  }
}
