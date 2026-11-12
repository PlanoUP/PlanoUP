import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { isRequestFieldUser } from "@/lib/auth/fieldAuth";
import { isRequestEditor } from "@/lib/auth/editAuth";
import { isBlobConfigured } from "@/lib/blob";

export const dynamic = "force-dynamic";

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);

export async function POST(request: Request) {
  const fieldUser = await isRequestFieldUser();
  const authorized = fieldUser ? true : await isRequestEditor();
  if (!authorized) {
    return NextResponse.json({ error: "UNAUTHORIZED", message: "Entre como Fiscal para enviar fotos." }, { status: 401 });
  }
  if (!isBlobConfigured()) {
    return NextResponse.json(
      { error: "BLOB_NOT_CONFIGURED", message: "Armazenamento de fotos ainda não configurado neste projeto." },
      { status: 503 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "NO_FILE", message: "Nenhum arquivo enviado." }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "FILE_TOO_LARGE", message: "Foto maior que 8MB." }, { status: 400 });
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ error: "INVALID_TYPE", message: "Formato de imagem não suportado." }, { status: 400 });
    }

    const ext = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
    const pathname = `field-photos/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const blob = await put(pathname, file, { access: "public" });
    return NextResponse.json({ url: blob.url }, { status: 201 });
  } catch (err) {
    console.error("POST /api/field-entries/photos failed", err);
    return NextResponse.json({ error: "INTERNAL_ERROR", message: "Falha ao enviar a foto." }, { status: 500 });
  }
}
