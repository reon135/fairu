import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { writeFile } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export async function GET(request: NextRequest) {
  const db = getDb();
  const tag = request.nextUrl.searchParams.get("tag");

  let images;
  if (tag) {
    images = db
      .prepare(
        `SELECT DISTINCT i.* FROM images i
         JOIN image_tags it ON i.id = it.image_id
         JOIN tags t ON it.tag_id = t.id
         WHERE t.name = ?
         ORDER BY i.created_at DESC`
      )
      .all(tag);
  } else {
    images = db
      .prepare("SELECT * FROM images ORDER BY created_at DESC")
      .all();
  }

  const imagesWithTags = (images as any[]).map((img) => {
    const tags = db
      .prepare(
        `SELECT t.name FROM tags t
         JOIN image_tags it ON t.id = it.tag_id
         WHERE it.image_id = ?`
      )
      .all(img.id) as { name: string }[];
    return { ...img, tags: tags.map((t) => t.name) };
  });

  return NextResponse.json(imagesWithTags);
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const files = formData.getAll("files") as File[];
  const tagsRaw = formData.get("tags") as string | null;
  const tagNames = tagsRaw
    ? tagsRaw
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  if (files.length === 0) {
    return NextResponse.json({ error: "No files provided" }, { status: 400 });
  }

  const db = getDb();
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  const results: any[] = [];

  const insertImage = db.prepare(
    "INSERT INTO images (filename, original_name, mime_type, size) VALUES (?, ?, ?, ?)"
  );
  const insertTag = db.prepare(
    "INSERT OR IGNORE INTO tags (name) VALUES (?)"
  );
  const getTag = db.prepare("SELECT id FROM tags WHERE name = ?");
  const insertImageTag = db.prepare(
    "INSERT OR IGNORE INTO image_tags (image_id, tag_id) VALUES (?, ?)"
  );

  for (const file of files) {
    const ext = path.extname(file.name) || ".png";
    const filename = `${uuidv4()}${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    await writeFile(path.join(uploadDir, filename), buffer);

    const result = insertImage.run(
      filename,
      file.name,
      file.type || "image/png",
      file.size
    );
    const imageId = result.lastInsertRowid;

    for (const tagName of tagNames) {
      insertTag.run(tagName);
      const tag = getTag.get(tagName) as { id: number };
      if (tag) {
        insertImageTag.run(imageId, tag.id);
      }
    }

    results.push({
      id: imageId,
      filename,
      original_name: file.name,
      tags: tagNames,
    });
  }

  return NextResponse.json(results, { status: 201 });
}
