import { NextResponse } from "next/server";
import { isRequestEditor } from "@/lib/auth/editAuth";
import { isDatabaseConfigured } from "@/lib/db/client";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ editable: false });
  }
  try {
    const editable = await isRequestEditor();
    return NextResponse.json({ editable });
  } catch (err) {
    console.error("GET /api/auth/status failed", err);
    return NextResponse.json({ editable: false });
  }
}
