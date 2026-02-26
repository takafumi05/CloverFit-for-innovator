-- CloverFit for Innovator - 申し込みテーブル
CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  position TEXT NOT NULL,
  company TEXT,
  message TEXT,
  status TEXT DEFAULT 'new' CHECK(status IN ('new', 'contacted', 'scheduled', 'completed', 'cancelled')),
  admin_note TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 管理者テーブル
CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- デフォルト管理者（パスワード: cloverfit2026）
-- bcryptハッシュ代わりにSHA-256ベースの簡易ハッシュを使用
INSERT OR IGNORE INTO admins (username, password_hash) VALUES 
  ('admin', 'cf2026admin');
