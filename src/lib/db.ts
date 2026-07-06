import { getCloudflareContext } from "@opennextjs/cloudflare";

/** D1 バインディング（wrangler.jsonc の binding "DB"） */
export function getDb(): D1Database {
  return getCloudflareContext().env.DB;
}

/** Worker の実行コンテキスト（waitUntil 等） */
export function getExecutionCtx() {
  return getCloudflareContext().ctx;
}

/**
 * 現行 initDB と同一。テーブルが無ければ作成し、デフォルト管理者を投入。
 * （現行の「毎リクエスト IF NOT EXISTS」挙動を踏襲）
 */
export async function ensureSchema(db: D1Database): Promise<void> {
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      position TEXT NOT NULL,
      company TEXT,
      message TEXT,
      status TEXT DEFAULT 'new',
      admin_note TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`),
    db.prepare(
      `INSERT OR IGNORE INTO admins (username, password_hash) VALUES ('admin', 'cf2026admin')`
    ),
  ]);
}
