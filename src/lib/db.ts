import { getCloudflareContext } from "@opennextjs/cloudflare";

/** D1 バインディング（wrangler.jsonc の binding "DB"） */
export function getDb(): D1Database {
  return getCloudflareContext().env.DB;
}

/** Worker の実行コンテキスト（waitUntil 等） */
export function getExecutionCtx() {
  return getCloudflareContext().ctx;
}

// toB フォームで追加した任意項目の列
const B2B_COLUMNS = [
  "employee_count",
  "headcount",
  "timing",
  "venue",
  "plan",
] as const;

/**
 * テーブルが無ければ作成し、デフォルト管理者を投入。
 * 既存DB（旧スキーマ）向けには不足している toB 列を冪等に追加する。
 */
export async function ensureSchema(db: D1Database): Promise<void> {
  // 管理者認証は env(ADMIN_*) + JWT で行うため admins テーブルは不要
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      position TEXT,
      company TEXT,
      message TEXT,
      employee_count TEXT,
      headcount TEXT,
      timing TEXT,
      venue TEXT,
      plan TEXT,
      status TEXT DEFAULT 'new',
      admin_note TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`
    )
    .run();

  // 既存DBに不足列があれば追加（新規DBでは CREATE TABLE 済みなので何もしない）
  const info = await db.prepare(`PRAGMA table_info(bookings)`).all();
  const existing = new Set(
    (info.results as { name: string }[]).map((r) => r.name)
  );
  for (const col of B2B_COLUMNS) {
    if (!existing.has(col)) {
      try {
        await db.prepare(`ALTER TABLE bookings ADD COLUMN ${col} TEXT`).run();
      } catch {
        // 既に存在（競合時）— 無視
      }
    }
  }
}

/** アクセス計測イベント用テーブル（軽量なので booking とは分離） */
export async function ensureAnalytics(db: D1Database): Promise<void> {
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS analytics_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT,
      type TEXT,
      path TEXT,
      section TEXT,
      duration_ms INTEGER,
      referrer TEXT,
      country TEXT,
      region TEXT,
      city TEXT,
      device TEXT,
      browser TEXT,
      os TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`),
    db.prepare(
      `CREATE INDEX IF NOT EXISTS idx_analytics_created ON analytics_events (created_at)`
    ),
    db.prepare(
      `CREATE INDEX IF NOT EXISTS idx_analytics_type ON analytics_events (type)`
    ),
  ]);

  // 既存の analytics_events に region 列が無ければ追加（冪等）
  const info = await db.prepare(`PRAGMA table_info(analytics_events)`).all();
  const cols = new Set((info.results as { name: string }[]).map((r) => r.name));
  if (!cols.has("region")) {
    try {
      await db.prepare(`ALTER TABLE analytics_events ADD COLUMN region TEXT`).run();
    } catch {
      // 既に存在
    }
  }
}
