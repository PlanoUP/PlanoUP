import { NextResponse } from "next/server";
import { deleteMapCoordinate } from "@/lib/db/mapCoordinatesRepo";
import { isRequestEditor } from "@/lib/auth/editAuth";

export const dynamic = "force-dynamic";

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  if (!(await isRequestEditor())) {
    return NextResponse.json(
      { error: "UNAUTHORIZED", message: "Desbloqueie o modo de edição para remover a coordenada." },
      { status: 401 }
    );
  }
  try {
    await deleteMapCoordinate(decodeURIComponent(params.id));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/map-coordinates/[id] failed", err);
    return NextResponse.json({ error: "INTERNAL_ERROR", message: "Falha ao remover a coordenada." }, { status: 500 });
  }
}
