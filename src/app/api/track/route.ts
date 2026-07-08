import { getCloudflareContext } from "@opennextjs/cloudflare";
import { ensureAnalytics, getDb } from "@/lib/db";
import { parseUserAgent } from "@/lib/ua";

export const dynamic = "force-dynamic";

type InEvent = { type?: string; section?: string; duration?: number };

const clamp = (s: unknown, max: number) =>
  typeof s === "string" ? s.slice(0, max) : null;

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as {
    sessionId?: string;
    path?: string;
    referrer?: string;
    events?: InEvent[];
  } | null;

  // 収集は fire-and-forget。不正でも 204 で静かに終える。
  if (!body?.sessionId || !Array.isArray(body.events) || body.events.length === 0) {
    return new Response(null, { status: 204 });
  }

  const ctx = getCloudflareContext();
  const cf = ctx.cf as
    | { country?: string; region?: string; city?: string }
    | undefined;
  const country = cf?.country || "unknown";
  const region = cf?.region || null; // 日本なら都道府県（IP由来の推定）
  const city = cf?.city || null;
  const ua = parseUserAgent(req.headers.get("user-agent"));

  const sessionId = clamp(body.sessionId, 64);
  const path = clamp(body.path, 256) || "/";
  const referrer = clamp(body.referrer, 256);

  try {
    const db = getDb();
    await ensureAnalytics(db);

    const rows = body.events.slice(0, 40).map((e) =>
      db
        .prepare(
          `INSERT INTO analytics_events
            (session_id, type, path, section, duration_ms, referrer, country, region, city, device, browser, os)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(
          sessionId,
          e.type === "section" ? "section" : "pageview",
          path,
          e.section ? String(e.section).slice(0, 64) : null,
          typeof e.duration === "number" && isFinite(e.duration)
            ? Math.max(0, Math.min(Math.round(e.duration), 86_400_000))
            : null,
          referrer,
          country,
          region,
          city,
          ua.device,
          ua.browser,
          ua.os
        )
    );
    await db.batch(rows);
  } catch (err) {
    console.error("track error:", err);
  }

  return new Response(null, { status: 204 });
}
