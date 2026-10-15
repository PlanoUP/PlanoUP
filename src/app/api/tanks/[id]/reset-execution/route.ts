import { NextResponse } from "next/server";
import { resetTankExecution } from "@/lib/db/tanksRepo";
import { isRequestEditor } from "@/lib/auth/editAuth";

export const dynamic = "force-dynamic";

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  if (!(await isRequestEditor())) {
    return NextResponse.json(
      { error: "UNAUTHORIZED", message: "Desbloqueie o modo de edição para redefinir a execução do tanque." },
      { status: 401 }
    );
  }
  try {
    const tank = await resetTankExecution(params.id);
    if (!tank) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    return NextResponse.json({ tank });
  } catch (err) {
    console.error("POST /api/tanks/[id]/reset-execution failed", err);
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: "Falha ao redefinir a execução do tanque." },
      { status: 500 }
    );
  }
}
