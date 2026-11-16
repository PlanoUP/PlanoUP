import { NextResponse } from "next/server";
import { listActionPlans, createActionPlan } from "@/lib/db/fieldActionPlansRepo";
import { isRequestFieldUser } from "@/lib/auth/fieldAuth";
import { isRequestEditor } from "@/lib/auth/editAuth";
import { isDatabaseConfigured } from "@/lib/db/client";
import { ActionPlanInput } from "@/lib/brava/field/actionPlan";

export const dynamic = "force-dynamic";

/** Read is open to anyone with the painel open — this is the alert banner's own data source, same spirit as /api/field-entries GET. */
export async function GET(request: Request) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ plans: [] });
  }
  try {
    const onlyActive = new URL(request.url).searchParams.get("all") !== "1";
    const plans = await listActionPlans({ onlyActive });
    return NextResponse.json({ plans });
  } catch (err) {
    console.error("GET /api/action-plans failed", err);
    return NextResponse.json({ error: "INTERNAL_ERROR", message: "Falha ao consultar os planos de ação." }, { status: 500 });
  }
}

/** Same narrow door as /api/field-entries: a Fiscal's own login, or the shared editor password. */
export async function POST(request: Request) {
  const fieldUser = await isRequestFieldUser();
  const editor = fieldUser ? null : (await isRequestEditor()) ? { id: "editor", name: "Editor" } : null;
  const author = fieldUser ? { id: fieldUser.id, name: fieldUser.name } : editor;
  if (!author) {
    return NextResponse.json(
      { error: "UNAUTHORIZED", message: "Entre como Fiscal (ou desbloqueie o modo de edição) para acionar um plano de ação." },
      { status: 401 }
    );
  }

  try {
    const body = (await request.json()) as ActionPlanInput;
    if (!body.tankId || !body.tankTag || !body.description?.trim()) {
      return NextResponse.json(
        { error: "INVALID_INPUT", message: "Descreva o impedimento antes de acionar o plano de ação." },
        { status: 400 }
      );
    }
    const plan = await createActionPlan({
      tankId: body.tankId,
      tankTag: body.tankTag,
      description: body.description,
      createdByUserId: author.id,
      createdByName: author.name,
    });
    return NextResponse.json({ plan }, { status: 201 });
  } catch (err) {
    console.error("POST /api/action-plans failed", err);
    return NextResponse.json({ error: "INTERNAL_ERROR", message: "Falha ao acionar o plano de ação." }, { status: 500 });
  }
}
