import { NextResponse } from "next/server";
import { duplicateMaterial } from "@/lib/db/materialsRepo";
import { isRequestEditor } from "@/lib/auth/editAuth";

export const dynamic = "force-dynamic";

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  if (!(await isRequestEditor())) {
    return NextResponse.json(
      { error: "UNAUTHORIZED", message: "Desbloqueie o modo de edição para duplicar o material." },
      { status: 401 }
    );
  }
  try {
    const material = await duplicateMaterial(params.id);
    if (!material) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    return NextResponse.json({ material }, { status: 201 });
  } catch (err) {
    console.error("POST /api/materials/[id]/duplicate failed", err);
    return NextResponse.json({ error: "INTERNAL_ERROR", message: "Falha ao duplicar o material." }, { status: 500 });
  }
}
