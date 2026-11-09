import { NextResponse } from "next/server";
import { isDatabaseConfigured } from "@/lib/db/client";
import { closeReport } from "@/lib/db/executiveReportsRepo";
import { isRequestEditor } from "@/lib/auth/editAuth";
import { ExecutiveReportSnapshot } from "@/lib/brava/reports/types";

export const dynamic = "force-dynamic";

/**
 * The client computes the full snapshot (kpis, physicalProgress, financial,
 * tankMatrix, milestones) from its own live tank/cost data right before
 * calling this, and posts the whole thing — the server's only job is to
 * freeze it atomically-enough and refuse a second close, never to
 * recompute it itself (there's no server-side tank/cost query layer this
 * route would need to duplicate from the client contexts).
 */
export async function POST(request: Request, { params }: { params: { id: string } }) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { error: "DATABASE_NOT_CONFIGURED", message: "Nenhum banco de dados conectado ao projeto ainda." },
      { status: 503 }
    );
  }
  if (!(await isRequestEditor())) {
    return NextResponse.json(
      { error: "UNAUTHORIZED", message: "Desbloqueie o modo de edição para fechar o relatório da semana." },
      { status: 401 }
    );
  }
  try {
    const id = decodeURIComponent(params.id);
    const body = (await request.json()) as ExecutiveReportSnapshot;
    if (body.id !== id) {
      return NextResponse.json({ error: "ID_MISMATCH", message: "ID do relatório não confere." }, { status: 400 });
    }
    const report = await closeReport(body);
    return NextResponse.json({ report });
  } catch (err) {
    if (err instanceof Error && err.message === "REPORT_ALREADY_CLOSED") {
      return NextResponse.json(
        { error: "REPORT_ALREADY_CLOSED", message: "Esse relatório já foi fechado anteriormente." },
        { status: 409 }
      );
    }
    console.error("POST /api/reports/[id]/close failed", err);
    return NextResponse.json({ error: "INTERNAL_ERROR", message: "Falha ao fechar o relatório." }, { status: 500 });
  }
}
