import { NextResponse } from "next/server";
import { resolveActionPlan } from "@/lib/db/fieldActionPlansRepo";
import { isRequestEditor } from "@/lib/auth/editAuth";

export const dynamic = "force-dynamic";

/** Resolving (dismissing) a plano de ação is an administrative call, not a Fiscal's — same gate as /api/field-users. */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  if (!(await isRequestEditor())) {
    return NextResponse.json(
      { error: "UNAUTHORIZED", message: "Desbloqueie o modo de edição para encerrar o plano de ação." },
      { status: 401 }
    );
  }
  try {
    const body = await request.json().catch(() => ({}));
    if (body.resolved !== true) {
      return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
    }
    const plan = await resolveActionPlan(params.id, "Editor");
    if (!plan) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    return NextResponse.json({ plan });
  } catch (err) {
    console.error("PATCH /api/action-plans/[id] failed", err);
    return NextResponse.json({ error: "INTERNAL_ERROR", message: "Falha ao encerrar o plano de ação." }, { status: 500 });
  }
}
