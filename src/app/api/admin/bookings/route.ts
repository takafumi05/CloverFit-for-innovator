import { ensureSchema, getDb } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

const LIMIT = 20;

export async function GET(req: Request) {
  const auth = requireAdmin(req);
  if (auth instanceof Response) return auth;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const page = parseInt(searchParams.get("page") || "1", 10);
  const offset = (page - 1) * LIMIT;
  const filtered = status && status !== "all";

  try {
    const db = getDb();
    await ensureSchema(db);

    let q = "SELECT * FROM bookings";
    const p: unknown[] = [];
    if (filtered) {
      q += " WHERE status = ?";
      p.push(status);
    }
    q += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    p.push(LIMIT, offset);
    const bookings = await db
      .prepare(q)
      .bind(...p)
      .all();

    let cq = "SELECT COUNT(*) as total FROM bookings";
    const cp: unknown[] = [];
    if (filtered) {
      cq += " WHERE status = ?";
      cp.push(status);
    }
    const countResult = await db
      .prepare(cq)
      .bind(...cp)
      .first<{ total: number }>();

    return Response.json({
      bookings: bookings.results,
      total: countResult?.total || 0,
      page,
      limit: LIMIT,
    });
  } catch {
    return Response.json({ error: "データ取得エラー" }, { status: 500 });
  }
}
