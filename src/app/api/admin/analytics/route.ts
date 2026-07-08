import { ensureAnalytics, getDb } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const auth = await requireAdmin(req);
  if (auth instanceof Response) return auth;

  const range = new URL(req.url).searchParams.get("range") === "30d" ? "30d" : "7d";
  const modifier = range === "30d" ? "-30 days" : "-7 days";

  try {
    const db = getDb();
    await ensureAnalytics(db);

    const [
      totals,
      byDay,
      byCountry,
      byRegion,
      byDevice,
      byBrowser,
      topPages,
      sectionDwell,
    ] = await Promise.all([
        db
          .prepare(
            `SELECT
               SUM(CASE WHEN type='pageview' THEN 1 ELSE 0 END) AS pv,
               COUNT(DISTINCT session_id) AS sessions,
               AVG(CASE WHEN section='(page)' THEN duration_ms END) AS avg_page_dwell
             FROM analytics_events WHERE created_at >= datetime('now', ?)`
          )
          .bind(modifier)
          .first<{ pv: number; sessions: number; avg_page_dwell: number | null }>(),
        db
          .prepare(
            `SELECT date(created_at) AS day, COUNT(*) AS count
             FROM analytics_events
             WHERE type='pageview' AND created_at >= datetime('now', ?)
             GROUP BY day ORDER BY day`
          )
          .bind(modifier)
          .all(),
        db
          .prepare(
            `SELECT country, COUNT(*) AS count
             FROM analytics_events
             WHERE type='pageview' AND created_at >= datetime('now', ?)
             GROUP BY country ORDER BY count DESC LIMIT 12`
          )
          .bind(modifier)
          .all(),
        db
          .prepare(
            `SELECT region, COUNT(*) AS count
             FROM analytics_events
             WHERE type='pageview' AND region IS NOT NULL AND region != ''
               AND created_at >= datetime('now', ?)
             GROUP BY region ORDER BY count DESC LIMIT 12`
          )
          .bind(modifier)
          .all(),
        db
          .prepare(
            `SELECT device, COUNT(*) AS count
             FROM analytics_events
             WHERE type='pageview' AND created_at >= datetime('now', ?)
             GROUP BY device ORDER BY count DESC`
          )
          .bind(modifier)
          .all(),
        db
          .prepare(
            `SELECT browser, COUNT(*) AS count
             FROM analytics_events
             WHERE type='pageview' AND created_at >= datetime('now', ?)
             GROUP BY browser ORDER BY count DESC LIMIT 8`
          )
          .bind(modifier)
          .all(),
        db
          .prepare(
            `SELECT path, COUNT(*) AS count
             FROM analytics_events
             WHERE type='pageview' AND created_at >= datetime('now', ?)
             GROUP BY path ORDER BY count DESC LIMIT 10`
          )
          .bind(modifier)
          .all(),
        db
          .prepare(
            `SELECT section, AVG(duration_ms) AS avg_ms, COUNT(*) AS count
             FROM analytics_events
             WHERE type='section' AND section != '(page)' AND created_at >= datetime('now', ?)
             GROUP BY section ORDER BY avg_ms DESC`
          )
          .bind(modifier)
          .all(),
      ]);

    return Response.json({
      range,
      totals: {
        pv: totals?.pv || 0,
        sessions: totals?.sessions || 0,
        avgPageDwellMs: Math.round(totals?.avg_page_dwell || 0),
      },
      byDay: byDay.results,
      byCountry: byCountry.results,
      byRegion: byRegion.results,
      byDevice: byDevice.results,
      byBrowser: byBrowser.results,
      topPages: topPages.results,
      sectionDwell: sectionDwell.results,
    });
  } catch (err) {
    console.error("analytics error:", err);
    return Response.json({ error: "集計エラー" }, { status: 500 });
  }
}
