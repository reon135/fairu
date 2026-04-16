import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { readFile } from "fs/promises";
import path from "path";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDb();

  const image = db.prepare("SELECT * FROM images WHERE id = ?").get(Number(id)) as any;
  if (!image) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const filePath = path.join(process.cwd(), "public", "uploads", image.filename);

  try {
    const buffer = await readFile(filePath);
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": image.mime_type,
        "Content-Disposition": `attachment; filename="${encodeURIComponent(image.original_name)}"`,
        "Content-Length": String(buffer.length),
      },
    });
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
