import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { unlink } from "fs/promises";
import path from "path";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDb();

  const image = db.prepare("SELECT * FROM images WHERE id = ?").get(Number(id)) as any;
  if (!image) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    await unlink(path.join(process.cwd(), "public", "uploads", image.filename));
  } catch {
    // file may already be deleted
  }

  db.prepare("DELETE FROM images WHERE id = ?").run(Number(id));

  return NextResponse.json({ success: true });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDb();
  const body = await request.json();
  const tagNames: string[] = body.tags || [];

  const image = db.prepare("SELECT * FROM images WHERE id = ?").get(Number(id));
  if (!image) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Clear existing tags
  db.prepare("DELETE FROM image_tags WHERE image_id = ?").run(Number(id));

  const insertTag = db.prepare("INSERT OR IGNORE INTO tags (name) VALUES (?)");
  const getTag = db.prepare("SELECT id FROM tags WHERE name = ?");
  const insertImageTag = db.prepare(
    "INSERT OR IGNORE INTO image_tags (image_id, tag_id) VALUES (?, ?)"
  );

  for (const tagName of tagNames) {
    insertTag.run(tagName);
    const tag = getTag.get(tagName) as { id: number };
    if (tag) {
      insertImageTag.run(Number(id), tag.id);
    }
  }

  db.prepare("UPDATE images SET updated_at = datetime('now') WHERE id = ?").run(
    Number(id)
  );

  return NextResponse.json({ success: true, tags: tagNames });
}
