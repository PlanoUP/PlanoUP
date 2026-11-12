import { NextResponse } from "next/server";
import { isRequestFieldUser } from "@/lib/auth/fieldAuth";
import { toPublicFieldUser } from "@/lib/brava/field/types";
import { isDatabaseConfigured } from "@/lib/db/client";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ user: null });
  }
  try {
    const user = await isRequestFieldUser();
    return NextResponse.json({ user: user ? toPublicFieldUser(user) : null });
  } catch (err) {
    console.error("GET /api/field-auth/status failed", err);
    return NextResponse.json({ user: null });
  }
}
