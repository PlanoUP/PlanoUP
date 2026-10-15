import { NextResponse } from "next/server";
import { deleteMapCalloutOffset } from "@/lib/db/mapCalloutOffsetsRepo";
import { isRequestEditor } from "@/lib/auth/editAuth";

export const dynamic = "force-dynamic";

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  if (!(await isRequestEditor())) {
    return NextResponse.json(
      { error: "UNAUTHORIZED", message: "Desbloqueie o modo de edição para redefinir a posição do informativo." },
      { status: 401 }
    );
  }
  try {
    await deleteMapCalloutOffset(decodeURIComponent(params.id));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/map-callout-offsets/[id] failed", err);
    return NextResponse.json({ error: "INTERNAL_ERROR", message: "Falha ao redefinir a posição do informativo." }, { status: 500 });
  }
}
