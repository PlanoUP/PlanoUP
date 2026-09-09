import { NextResponse } from "next/server";
import { deleteMaterial, updateMaterial } from "@/lib/db/materialsRepo";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const patch = await request.json();
    const material = await updateMaterial(params.id, patch);
    if (!material) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    return NextResponse.json({ material });
  } catch (err) {
    console.error("PATCH /api/materials/[id] failed", err);
    return NextResponse.json({ error: "INTERNAL_ERROR", message: "Falha ao atualizar o material." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    await deleteMaterial(params.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/materials/[id] failed", err);
    return NextResponse.json({ error: "INTERNAL_ERROR", message: "Falha ao excluir o material." }, { status: 500 });
  }
}
