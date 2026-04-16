import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  const db = getDb();
  const tags = db
    .prepare(
      `SELECT t.id, t.name, COUNT(it.image_id) as count
       FROM tags t
       LEFT JOIN image_tags it ON t.id = it.tag_id
       GROUP BY t.id
       HAVING count > 0
       ORDER BY t.name`
    )
    .all();

  return NextResponse.json(tags);
}
