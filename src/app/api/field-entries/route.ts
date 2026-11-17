import { NextResponse } from "next/server";
import { getTank } from "@/lib/db/tanksRepo";
import { createFieldEntry, listFieldEntries } from "@/lib/db/fieldEntriesRepo";
import { isRequestFieldUser } from "@/lib/auth/fieldAuth";
import { isRequestEditor } from "@/lib/auth/editAuth";
import { todayISO } from "@/lib/brava/date-utils";
import { FieldEntryInput } from "@/lib/brava/field/types";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const tankId = new URL(request.url).searchParams.get("tankId") ?? undefined;
    const entries = await listFieldEntries(tankId);
    return NextResponse.json({ entries });
  } catch (err) {
    console.error("GET /api/field-entries failed", err);
    return NextResponse.json({ error: "INTERNAL_ERROR", message: "Falha ao consultar os registros." }, { status: 500 });
  }
}

/**
 * Deliberately NOT reused by any other write path — the rest of the painel
 * (Tank Detail, Consolidado, Custos, Materiais, Mapa, Relatório Executivo)
 * keeps requiring only the shared editor password exactly as before. This
 * is the one narrow door a Fiscal's own login also opens, scoped to a
 * single tank's day log. A field entry here is a narrative/photo record of
 * something that happened — it never touches the tank's own formal Gantt
 * progress (that stays an editor-only action elsewhere).
 */
export async function POST(request: Request) {
  const fieldUser = await isRequestFieldUser();
  const editor = fieldUser ? null : (await isRequestEditor()) ? { id: "editor", name: "Editor" } : null;
  const author = fieldUser ? { id: fieldUser.id, name: fieldUser.name } : editor;
  if (!author) {
    return NextResponse.json(
      { error: "UNAUTHORIZED", message: "Entre como Fiscal (ou desbloqueie o modo de edição) para registrar." },
      { status: 401 }
    );
  }

  try {
    const body = (await request.json()) as FieldEntryInput;
    const tank = await getTank(body.tankId);
    if (!tank) return NextResponse.json({ error: "NOT_FOUND", message: "Tanque não encontrado." }, { status: 404 });
    if (!body.activityName?.trim()) {
      return NextResponse.json({ error: "INVALID_INPUT", message: "Escolha ou digite a atividade." }, { status: 400 });
    }

    const entry = await createFieldEntry({
      tankId: tank.id,
      tankTag: tank.tag,
      date: todayISO(),
      activityName: body.activityName.trim(),
      userId: author.id,
      userName: author.name,
      observacao: body.observacao?.trim() ?? "",
      ocorrencia: Boolean(body.ocorrencia),
      photos: Array.isArray(body.photos) ? body.photos.filter((p) => typeof p === "string") : [],
    });

    return NextResponse.json({ entry }, { status: 201 });
  } catch (err) {
    console.error("POST /api/field-entries failed", err);
    return NextResponse.json({ error: "INTERNAL_ERROR", message: "Falha ao salvar o registro." }, { status: 500 });
  }
}
