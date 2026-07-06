import { ensureSchema, getDb } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const auth = requireAdmin(req);
  if (auth instanceof Response) return auth;

  try {
    const db = getDb();
    await ensureSchema(db);
    const stats = await db
      .prepare(
        `SELECT COUNT(*) as total,
          SUM(CASE WHEN status='new' THEN 1 ELSE 0 END) as new_count,
          SUM(CASE WHEN status='contacted' THEN 1 ELSE 0 END) as contacted_count,
          SUM(CASE WHEN status='scheduled' THEN 1 ELSE 0 END) as scheduled_count,
          SUM(CASE WHEN status='completed' THEN 1 ELSE 0 END) as completed_count,
          SUM(CASE WHEN status='cancelled' THEN 1 ELSE 0 END) as cancelled_count
        FROM bookings`
      )
      .first();
    const recent = await db
      .prepare("SELECT * FROM bookings ORDER BY created_at DESC LIMIT 5")
      .all();
    return Response.json({ stats, recent: recent.results });
  } catch {
    return Response.json({ error: "データ取得エラー" }, { status: 500 });
  }
}
