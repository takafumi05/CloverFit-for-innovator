-- CloverFit アクセス計測イベント
CREATE TABLE IF NOT EXISTS analytics_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT,
  type TEXT,               -- 'pageview' | 'section'
  path TEXT,
  section TEXT,            -- section id（'(page)' はページ総滞在）
  duration_ms INTEGER,
  referrer TEXT,
  country TEXT,
  region TEXT,             -- 日本なら都道府県（IP由来の推定）
  city TEXT,
  device TEXT,             -- 'mobile' | 'tablet' | 'desktop'
  browser TEXT,
  os TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_analytics_created ON analytics_events (created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_type ON analytics_events (type);
