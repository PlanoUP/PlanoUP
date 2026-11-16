import { NextResponse } from "next/server";
import { getTank } from "@/lib/db/tanksRepo";
import { getFieldDailyLog, upsertFieldDailyLog } from "@/lib/db/fieldDailyLogRepo";
import { isRequestFieldUser } from "@/lib/auth/fieldAuth";
import { isRequestEditor } from "@/lib/auth/editAuth";
import { todayISO } from "@/lib/brava/date-utils";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const tankId = url.searchParams.get("tankId");
    const date = url.searchParams.get("date") ?? todayISO();
    if (!tankId) return NextResponse.json({ error: "INVALID_INPUT", message: "tankId é obrigatório." }, { status: 400 });
    const log = await getFieldDailyLog(tankId, date);
    return NextResponse.json({ log });
  } catch (err) {
    console.error("GET /api/field-daily-log failed", err);
    return NextResponse.json({ error: "INTERNAL_ERROR", message: "Falha ao consultar o registro do dia." }, { status: 500 });
  }
}

/** Same narrow door as /api/field-entries: a Fiscal's own login, or the shared editor password. Upsert, not append. */
export async function POST(request: Request) {
  const fieldUser = await isRequestFieldUser();
  const editor = fieldUser ? null : (await isRequestEditor()) ? { name: "Editor" } : null;
  const author = fieldUser ? { name: fieldUser.name } : editor;
  if (!author) {
    return NextResponse.json(
      { error: "UNAUTHORIZED", message: "Entre como Fiscal (ou desbloqueie o modo de edição) para registrar." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const tank = await getTank(body.tankId);
    if (!tank) return NextResponse.json({ error: "NOT_FOUND", message: "Tanque não encontrado." }, { status: 404 });

    const log = await upsertFieldDailyLog(
      {
        tankId: tank.id,
        tankTag: tank.tag,
        date: typeof body.date === "string" && body.date ? body.date : todayISO(),
        ptNumero: typeof body.ptNumero === "string" ? body.ptNumero.trim() : undefined,
        ptHorario: typeof body.ptHorario === "string" && body.ptHorario.length > 0 ? body.ptHorario : undefined,
        efetivo: typeof body.efetivo === "string" ? body.efetivo.trim() : undefined,
      },
      author.name
    );
    return NextResponse.json({ log });
  } catch (err) {
    console.error("POST /api/field-daily-log failed", err);
    return NextResponse.json({ error: "INTERNAL_ERROR", message: "Falha ao salvar o registro do dia." }, { status: 500 });
  }
}
