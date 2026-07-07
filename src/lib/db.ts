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
