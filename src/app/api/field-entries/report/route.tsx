import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { getTank } from "@/lib/db/tanksRepo";
import { listFieldEntriesByDate } from "@/lib/db/fieldEntriesRepo";
import { getFieldDailyLog } from "@/lib/db/fieldDailyLogRepo";
import { todayISO } from "@/lib/brava/date-utils";
import DailyReportDocument from "@/lib/brava/field/DailyReportDocument";

export const dynamic = "force-dynamic";

/** Read-only, same spirit as GET /api/field-entries — no write here, just compiles the day's existing records into a PDF. */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const tankId = url.searchParams.get("tankId");
    const date = url.searchParams.get("date") ?? todayISO();
    if (!tankId) return NextResponse.json({ error: "INVALID_INPUT", message: "tankId é obrigatório." }, { status: 400 });

    const tank = await getTank(tankId);
    if (!tank) return NextResponse.json({ error: "NOT_FOUND", message: "Tanque não encontrado." }, { status: 404 });

    const [entries, dailyLog] = await Promise.all([listFieldEntriesByDate(tankId, date), getFieldDailyLog(tankId, date)]);

    const buffer = await renderToBuffer(
      <DailyReportDocument tankTag={tank.tag} date={date} dailyLog={dailyLog} entries={entries} />
    );

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="relatorio-${tank.tag}-${date}.pdf"`,
      },
    });
  } catch (err) {
    console.error("GET /api/field-entries/report failed", err);
    return NextResponse.json({ error: "INTERNAL_ERROR", message: "Falha ao gerar o relatório." }, { status: 500 });
  }
}
