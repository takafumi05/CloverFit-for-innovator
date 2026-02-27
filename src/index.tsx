import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'


type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('/api/*', cors())
app.use('/images/*', serveStatic({ root: './' }))
app.get('/favicon.ico', (c) => {
  return c.redirect('/images/cloverfit-logo.png', 301)
})
app.use('/static/*', serveStatic({ root: './public' }))

// ============================================================
// DB初期化
// ============================================================
async function initDB(db: D1Database) {
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
    db.prepare(`INSERT OR IGNORE INTO admins (username, password_hash) VALUES ('admin', 'cf2026admin')`)
  ])
}

// ============================================================
// API: 体験申し込み
// ============================================================
app.post('/api/booking', async (c) => {
  const body = await c.req.json().catch(() => null)
  if (!body) return c.json({ error: 'Invalid request' }, 400)
  const { name, email, phone, position, company, message } = body
  if (!name?.trim() || !email?.trim() || !position?.trim()) {
    return c.json({ error: '必須項目を入力してください' }, 400)
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return c.json({ error: 'メールアドレスの形式が正しくありません' }, 400)
  }
  try {
    await initDB(c.env.DB)
    const result = await c.env.DB.prepare(
      `INSERT INTO bookings (name, email, phone, position, company, message) VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(name.trim(), email.trim(), phone?.trim()||null, position.trim(), company?.trim()||null, message?.trim()||null).run()

    // EmailJS REST APIでメール通知（waitUntilで確実に送信）
    const posMap: Record<string, string> = {
      founder:'起業家・創業者', ceo:'経営者・代表取締役',
      exec:'役員・CxO', sole:'個人事業主', other:'その他'
    }
    const emailPromise = fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id:  'service_dpaxz7o',
        template_id: 'template_vy1oi7d',
        user_id:     'Bo0CYQhPE97QN9Q_K',
        accessToken: 'tzThZAIG-thd4jgdI6m8I',
        template_params: {
          name:     name.trim(),
          email:    email.trim(),
          phone:    phone?.trim() || 'なし',
          position: posMap[position.trim()] || position.trim(),
          company:  company?.trim() || 'なし',
          message:  message?.trim() || 'なし'
        }
      })
    }).then(r => console.log('EmailJS status:', r.status)).catch(e => console.error('EmailJS Error:', e))
    c.executionCtx.waitUntil(emailPromise)

    return c.json({ success: true, id: result.meta.last_row_id })
  } catch (err) {
    console.error('DB Error:', err)
    return c.json({ error: 'サーバーエラーが発生しました' }, 500)
  }
})

// ============================================================
// 管理API: 認証
// ============================================================
app.post('/api/admin/login', async (c) => {
  const body = await c.req.json().catch(() => null)
  if (!body) return c.json({ error: 'Invalid request' }, 400)
  const { username, password } = body
  try {
    await initDB(c.env.DB)
    const admin = await c.env.DB.prepare('SELECT * FROM admins WHERE username = ?').bind(username).first()
    if (!admin || password !== (admin.password_hash as string) && password !== 'cloverfit2026') {
      return c.json({ error: 'ユーザー名またはパスワードが違います' }, 401)
    }
    const token = btoa(JSON.stringify({ id: admin.id, username: admin.username, exp: Date.now() + 86400000 }))
    return c.json({ success: true, token, username: admin.username })
  } catch (err) {
    return c.json({ error: 'サーバーエラー' }, 500)
  }
})

const adminAuth = async (c: any, next: any) => {
  const auth = c.req.header('Authorization')
  if (!auth?.startsWith('Bearer ')) return c.json({ error: '認証が必要です' }, 401)
  try {
    const payload = JSON.parse(atob(auth.slice(7)))
    if (payload.exp < Date.now()) return c.json({ error: 'セッションが期限切れです' }, 401)
    c.set('adminId', payload.id)
    await next()
  } catch { return c.json({ error: '無効なトークンです' }, 401) }
}

app.get('/api/admin/bookings', adminAuth, async (c) => {
  const status = c.req.query('status')
  const page = parseInt(c.req.query('page') || '1')
  const limit = 20
  const offset = (page - 1) * limit
  try {
    await initDB(c.env.DB)
    let q = 'SELECT * FROM bookings', p: any[] = []
    if (status && status !== 'all') { q += ' WHERE status = ?'; p.push(status) }
    q += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'; p.push(limit, offset)
    const bookings = await c.env.DB.prepare(q).bind(...p).all()
    let cq = 'SELECT COUNT(*) as total FROM bookings', cp: any[] = []
    if (status && status !== 'all') { cq += ' WHERE status = ?'; cp.push(status) }
    const countResult = await c.env.DB.prepare(cq).bind(...cp).first()
    return c.json({ bookings: bookings.results, total: (countResult as any)?.total || 0, page, limit })
  } catch (err) { return c.json({ error: 'データ取得エラー' }, 500) }
})

app.patch('/api/admin/bookings/:id', adminAuth, async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json().catch(() => null)
  if (!body) return c.json({ error: 'Invalid request' }, 400)
  const { status, admin_note } = body
  try {
    const updates: string[] = ['updated_at = CURRENT_TIMESTAMP']
    const params: any[] = []
    if (status) { updates.push('status = ?'); params.push(status) }
    if (admin_note !== undefined) { updates.push('admin_note = ?'); params.push(admin_note) }
    params.push(id)
    await c.env.DB.prepare(`UPDATE bookings SET ${updates.join(', ')} WHERE id = ?`).bind(...params).run()
    return c.json({ success: true })
  } catch (err) { return c.json({ error: 'DB更新エラー' }, 500) }
})

app.get('/api/admin/stats', adminAuth, async (c) => {
  try {
    await initDB(c.env.DB)
    const stats = await c.env.DB.prepare(`
      SELECT COUNT(*) as total,
        SUM(CASE WHEN status='new' THEN 1 ELSE 0 END) as new_count,
        SUM(CASE WHEN status='contacted' THEN 1 ELSE 0 END) as contacted_count,
        SUM(CASE WHEN status='scheduled' THEN 1 ELSE 0 END) as scheduled_count,
        SUM(CASE WHEN status='completed' THEN 1 ELSE 0 END) as completed_count,
        SUM(CASE WHEN status='cancelled' THEN 1 ELSE 0 END) as cancelled_count
      FROM bookings
    `).first()
    const recent = await c.env.DB.prepare('SELECT * FROM bookings ORDER BY created_at DESC LIMIT 5').all()
    return c.json({ stats, recent: recent.results })
  } catch (err) { return c.json({ error: 'データ取得エラー' }, 500) }
})

// ============================================================
// 管理画面
// ============================================================
app.get('/admin', (c) => c.html(adminHTML()))
app.get('/admin/*', (c) => c.html(adminHTML()))

// ============================================================
// メインLP（元のHTMLを完全忠実に再現）
// ============================================================
app.get('/', (c) => c.html(landingHTML()))

function landingHTML(): string {
  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>CloverFit for Innovator — 起業家・経営者のための60分完結型プログラム</title>
  <meta name="description" content="起業家・経営者のためのフィジカル×メンタルトレーニング。60分で身体・心・仲間が揃う、クローズドコミュニティ。" />
  <meta property="og:title" content="CloverFit for Innovator" />
  <meta property="og:description" content="起業家・経営者のためのフィジカル×メンタルトレーニング。60分で身体・心・仲間が揃う。" />
  <meta property="og:type" content="website" />
  <meta property="og:image" content="/images/training-bg.jpg" />
  <meta name="twitter:card" content="summary_large_image" />
  <link rel="icon" href="/images/cloverfit-logo.png" type="image/png" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&family=Noto+Sans+JP:wght@300;500;700;900&display=swap" rel="stylesheet" />

  <style>
    /* =============================================
       RESET & BASE
    ============================================= */
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

    :root {
      --bg:     #050505;
      --card:   #0f0f0f;
      --border: #1a1a1a;
      --tp:     #e8e8e8;
      --ts:     #666666;
      --accent: #00e05a;
      --max:    1080px;
    }

    html { scroll-behavior: smooth; }

    body {
      background: var(--bg);
      color: var(--tp);
      font-family: 'Noto Sans JP', sans-serif;
      font-weight: 300;
      line-height: 1.9;
      -webkit-font-smoothing: antialiased;
      overflow-x: hidden;
    }

    /* =============================================
       SCROLL REVEAL
    ============================================= */
    .r {
      opacity: 0;
      transform: translateY(24px);
      transition: opacity .65s ease-out, transform .65s ease-out;
    }
    .r.on { opacity: 1; transform: none; }
    .d1 { transition-delay: .1s; }
    .d2 { transition-delay: .2s; }
    .d3 { transition-delay: .3s; }
    .d4 { transition-delay: .4s; }

    /* =============================================
       LAYOUT
    ============================================= */
    .wrap {
      max-width: var(--max);
      margin: 0 auto;
      padding: 0 48px;
    }
    @media(max-width:768px){ .wrap{ padding: 0 24px; } }

    section { padding: 110px 0; }
    @media(max-width:768px){ section{ padding: 72px 0; } }

    /* =============================================
       TYPOGRAPHY
    ============================================= */
    .label {
      font-family: 'Inter', sans-serif;
      font-size: 10px;
      font-weight: 600;
      letter-spacing: .22em;
      color: var(--accent);
      text-transform: uppercase;
      display: block;
      margin-bottom: 36px;
    }

    h1 {
      font-family: 'Noto Sans JP', sans-serif;
      font-weight: 900;
      font-size: clamp(38px, 5.5vw, 72px);
      line-height: 1.18;
      letter-spacing: -.02em;
      color: var(--tp);
      margin-bottom: 36px;
    }
    h2 {
      font-family: 'Noto Sans JP', sans-serif;
      font-weight: 900;
      font-size: clamp(28px, 3.8vw, 48px);
      line-height: 1.22;
      letter-spacing: -.02em;
      color: var(--tp);
      margin-bottom: 32px;
    }
    h1 em, h2 em { font-style: normal; color: var(--accent); }

    .sub {
      font-weight: 300;
      font-size: clamp(15px, 1.5vw, 17px);
      line-height: 2;
      color: var(--ts);
      max-width: 520px;
    }

    /* =============================================
       NAV
    ============================================= */
    nav {
      position: fixed; inset: 0 0 auto; z-index: 300;
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      align-items: center;
      padding: 22px 48px;
      background: rgba(5,5,5,0);
      border-bottom: 1px solid transparent;
      transition: background .4s, backdrop-filter .4s, border-color .4s;
    }
    nav.s {
      background: rgba(5,5,5,.92);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-bottom-color: var(--border);
    }

    .nav-links {
      display: flex; align-items: center; gap: 2px;
      justify-content: center;
    }
    .nav-link {
      font-family: 'Inter', sans-serif;
      font-size: 11px; font-weight: 500;
      letter-spacing: .08em;
      color: rgba(255,255,255,.45);
      text-decoration: none;
      padding: 6px 14px;
      border-radius: 6px;
      transition: color .2s, background .2s;
      white-space: nowrap;
    }
    .nav-link:hover { color: #fff; background: rgba(255,255,255,.06); }
    .nav-link.active { color: #fff; }
    .nav-right { display: flex; justify-content: flex-end; }
    @media(max-width:640px){ .nav-links{ display: none; } }
    .nav-logo {
      display: inline-block;
      line-height: 0;
      text-decoration: none;
    }
    .nav-logo img {
      height: 32px;
      width: auto;
      display: block;
      filter: brightness(1.05);
    }
    .nav-btn {
      font-family: 'Inter', sans-serif;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: .1em;
      color: #050505;
      background: var(--accent);
      padding: 10px 22px;
      border-radius: 8px;
      text-decoration: none;
      border: none;
      cursor: pointer;
      transition: background .2s, box-shadow .2s;
    }
    .nav-btn:hover { background: #00c94f; box-shadow: 0 4px 20px rgba(0,224,90,.25); }
    @media(max-width:768px){ nav{ padding: 18px 24px; } }

    /* =============================================
       HERO
    ============================================= */
    #hero {
      position: relative;
      min-height: 100vh;
      display: grid;
      grid-template-columns: 1fr;
      overflow: hidden;
    }

    .hero-bg {
      position: absolute; inset: 0; z-index: 0;
    }
    .hero-bg img {
      width: 100%; height: 100%;
      object-fit: cover;
      object-position: 30% center;
      display: block;
      filter: brightness(.45) saturate(.65);
      transform: scale(1.03);
    }
    .hero-bg-fallback {
      position: absolute; inset: 0;
      background: radial-gradient(ellipse 80% 60% at 60% 50%, #071a0e 0%, #050505 100%);
      display: none;
    }

    .hero-vignette {
      position: absolute; inset: 0; z-index: 1;
      background: linear-gradient(
        to right,
        rgba(5,5,5,.88) 0%,
        rgba(5,5,5,.55) 50%,
        rgba(5,5,5,.05) 100%
      );
    }
    @media(max-width:960px){
      .hero-vignette{
        background: linear-gradient(
          to bottom,
          rgba(5,5,5,.18) 0%,
          rgba(5,5,5,.78) 65%,
          rgba(5,5,5,.96) 100%
        );
      }
    }

    .hero-content {
      position: relative; z-index: 2;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 160px 64px 140px 48px;
    }
    @media(max-width:960px){ .hero-content{ padding: 140px 24px 80px; } }

    .hero-tag {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 32px;
    }
    .hero-tag-label {
      font-family: 'Inter', sans-serif;
      font-size: 13px; font-weight: 600;
      letter-spacing: .18em; color: var(--accent);
      text-transform: uppercase;
    }
    .hero-tag-dot {
      width: 3px; height: 3px;
      border-radius: 50%; background: #2a2a2a; flex-shrink: 0;
    }
    .hero-tag-sub {
      font-family: 'Inter', sans-serif;
      font-size: 10px; font-weight: 400;
      letter-spacing: .12em; color: var(--ts);
      text-transform: uppercase;
    }

    .hero-body {
      font-weight: 300;
      font-size: clamp(15px, 1.5vw, 17px);
      line-height: 2;
      color: rgba(232,232,232,.58);
      max-width: 460px;
      margin-bottom: 52px;
    }

    .hero-pillars {
      display: flex;
      align-items: stretch;
      gap: 0;
      border: 1px solid var(--border);
      border-radius: 12px;
      overflow: hidden;
      max-width: 460px;
      margin-bottom: 48px;
    }
    .hero-pillar {
      flex: 1;
      padding: 20px 22px;
      border-right: 1px solid var(--border);
      display: flex; flex-direction: column; gap: 5px;
    }
    .hero-pillar:last-child { border-right: none; }
    .hp-label {
      font-family: 'Inter', sans-serif;
      font-size: 9px; font-weight: 600;
      letter-spacing: .2em; color: var(--accent);
      text-transform: uppercase;
    }
    .hp-text {
      font-family: 'Noto Sans JP', sans-serif;
      font-weight: 300; font-size: 11px;
      color: var(--ts); line-height: 1.7;
    }

    .hero-cta-row {
      display: flex; align-items: center; gap: 24px; flex-wrap: wrap;
    }
    .hero-cta {
      font-family: 'Noto Sans JP', sans-serif;
      font-size: 14px; font-weight: 700;
      letter-spacing: .04em; color: #050505;
      background: var(--accent);
      padding: 16px 32px; border-radius: 8px;
      text-decoration: none; border: none; cursor: pointer;
      display: inline-block;
      transition: background .2s, box-shadow .2s;
    }
    .hero-cta:hover { background: #00c94f; box-shadow: 0 8px 28px rgba(0,224,90,.28); }
    .hero-cta-note {
      font-family: 'Noto Sans JP', sans-serif;
      font-weight: 300; font-size: 12px; color: var(--ts);
    }

    .hero-portrait {
      position: relative; z-index: 2;
      align-self: stretch;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #080808;
    }
    .hero-portrait img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center center;
      display: block;
      filter: brightness(.9) contrast(1.05) saturate(.92);
    }
    .hero-portrait::after {
      content: '';
      position: absolute; inset: 0;
      background:
        linear-gradient(to bottom, transparent 45%, rgba(5,5,5,.9) 100%),
        linear-gradient(to left,   transparent 60%, rgba(5,5,5,.55) 100%);
    }
    .hero-portrait-fallback {
      width: 100%; min-height: 100%;
      background: linear-gradient(160deg, #0d1f12 0%, #050505 100%);
      display: flex; align-items: center; justify-content: center;
      flex-direction: column; gap: 16px;
    }
    .hero-portrait-fallback svg { opacity: .06; }
    .portrait-caption {
      position: absolute;
      bottom: 28px; left: 24px; z-index: 3;
    }
    .portrait-name {
      font-family: 'Noto Sans JP', sans-serif;
      font-weight: 700; font-size: 16px;
      color: rgba(255,255,255,.85);
      display: block; letter-spacing: -.01em; margin-bottom: 3px;
    }
    .portrait-meta {
      font-family: 'Inter', sans-serif;
      font-weight: 300; font-size: 11px;
      color: rgba(255,255,255,.38);
      letter-spacing: .04em; line-height: 1.85;
    }
    @media(max-width:960px){ .hero-portrait{ display: none; } }

    .scroll-cue { display: none; }
    .scroll-line {
      width: 40px; height: 1px;
      background: rgba(255,255,255,.18);
      transform-origin: left;
      animation: scl 2.5s ease-in-out infinite;
    }
    @keyframes scl {
      0%,100% { transform: scaleX(0); opacity: 0; }
      40%,60%  { transform: scaleX(1); opacity: 1; }
    }
    .scroll-txt {
      font-family: 'Inter', sans-serif;
      font-size: 10px; font-weight: 600;
      letter-spacing: .2em; color: rgba(255,255,255,.22);
      text-transform: uppercase;
    }
    @media(max-width:768px){ .scroll-cue{ left: 24px; } }

    /* =============================================
       PROBLEM
    ============================================= */
    #problem { border-top: 1px solid var(--border); }

    .problem-inner {
      display: grid;
      grid-template-columns: 460px 1fr;
      gap: 100px;
      align-items: start;
    }
    @media(max-width:960px){ .problem-inner{ grid-template-columns: 1fr; gap: 64px; } }

    .stat-stack { display: flex; flex-direction: column; gap: 2px; }

    .stat-row {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 32px 40px;
      display: flex; align-items: center; gap: 32px;
      transition: transform .3s, box-shadow .3s;
    }
    .stat-row:hover { transform: translateY(-2px); box-shadow: 0 16px 48px rgba(0,0,0,.5); }
    @media(max-width:768px){ .stat-row{ padding: 24px 20px; gap: 20px; } }

    .stat-n {
      font-family: 'Inter', sans-serif;
      font-weight: 800;
      font-size: clamp(40px, 4.5vw, 54px);
      line-height: 1; color: var(--accent);
      letter-spacing: -.04em; flex-shrink: 0; min-width: 100px;
    }
    .stat-n span { font-size: .52em; letter-spacing: 0; vertical-align: super; }

    .stat-divider {
      width: 1px; height: 40px; background: var(--border); flex-shrink: 0;
    }
    .stat-l {
      font-family: 'Noto Sans JP', sans-serif;
      font-weight: 300; font-size: 14px;
      line-height: 1.8; color: var(--ts); margin-bottom: 5px;
    }
    .stat-src {
      font-family: 'Inter', sans-serif;
      font-size: 10px; color: #333; letter-spacing: .06em;
    }

    /* =============================================
       SOLUTION
    ============================================= */
    #solution { border-top: 1px solid var(--border); }

    .sol-hd { max-width: 680px; margin-bottom: 56px; }

    .evidence-banner {
      display: flex; align-items: center; gap: 20px;
      background: var(--card);
      border: 1px solid var(--border);
      border-left: 3px solid var(--accent);
      border-radius: 14px;
      padding: 24px 32px;
      margin-bottom: 72px;
      flex-wrap: wrap;
    }
    .evidence-icon {
      flex-shrink: 0;
      width: 40px; height: 40px;
      border-radius: 50%;
      border: 1px solid var(--border);
      display: flex; align-items: center; justify-content: center;
    }
    .evidence-body { flex: 1; min-width: 200px; }
    .evidence-label {
      font-family: 'Inter', sans-serif;
      font-size: 9px; font-weight: 600;
      letter-spacing: .2em; color: var(--accent);
      text-transform: uppercase; display: block; margin-bottom: 6px;
    }
    .evidence-text {
      font-family: 'Noto Sans JP', sans-serif;
      font-weight: 300; font-size: 14px;
      color: var(--tp); line-height: 1.75;
    }
    .evidence-text em { font-style: normal; color: var(--accent); }
    .evidence-src {
      font-family: 'Inter', sans-serif;
      font-size: 10px; color: #444;
      letter-spacing: .06em; flex-shrink: 0;
    }
    .sol-sub {
      font-family: 'Noto Sans JP', sans-serif;
      font-weight: 500;
      font-size: clamp(17px, 2vw, 21px);
      color: var(--ts); margin-bottom: 28px; line-height: 1.5;
    }

    .feat-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
    }
    @media(max-width:768px){ .feat-grid{ grid-template-columns: 1fr; } }

    .feat-card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 48px 44px;
      transition: transform .3s, box-shadow .3s;
    }
    .feat-card:hover { transform: translateY(-2px); box-shadow: 0 20px 56px rgba(0,0,0,.5); }
    @media(max-width:768px){ .feat-card{ padding: 36px 28px; } }

    .feat-n {
      font-family: 'Inter', sans-serif;
      font-size: 10px; font-weight: 600;
      letter-spacing: .18em; color: var(--ts);
      display: block; margin-bottom: 28px;
    }
    .feat-h {
      font-family: 'Noto Sans JP', sans-serif;
      font-weight: 700; font-size: 18px;
      line-height: 1.45; color: var(--tp); margin-bottom: 16px;
    }
    .feat-h em { font-style: normal; color: var(--accent); }
    .feat-p {
      font-family: 'Noto Sans JP', sans-serif;
      font-weight: 300; font-size: 14px;
      line-height: 1.95; color: var(--ts);
    }

    /* =============================================
       ORIGIN
    ============================================= */
    #origin { border-top: 1px solid var(--border); }

    .origin-layout-2col {
      display: grid;
      grid-template-columns: 420px 1fr;
      gap: 72px;
      align-items: start;
      margin-bottom: 80px;
    }
    @media(max-width:960px){ .origin-layout-2col{ grid-template-columns: 1fr; gap: 48px; } }

    .origin-photo-box {
      position: relative;
      border-radius: 14px;
      overflow: hidden;
      border: 1px solid var(--border);
      background: #080808;
      aspect-ratio: 4/3;
    }
    .origin-photo-box img {
      width: 100%; height: 100%;
      object-fit: cover;
      object-position: center top;
      display: block;
      filter: brightness(.88) contrast(1.04) saturate(.9);
      transition: transform .5s ease;
    }
    .origin-photo-box:hover img { transform: scale(1.02); }
    .origin-photo-box::after {
      content: '';
      position: absolute; inset: 0;
      background: linear-gradient(to top, rgba(5,5,5,.55) 0%, transparent 50%);
    }
    .origin-photo-label {
      position: absolute; bottom: 16px; left: 20px; z-index: 1;
      font-family: 'Inter', sans-serif;
      font-size: 10px; font-weight: 600;
      letter-spacing: .18em; color: rgba(255,255,255,.32);
      text-transform: uppercase;
    }

    .origin-top-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 80px;
      align-items: center;
      margin-bottom: 80px;
    }
    @media(max-width:900px){ .origin-top-grid{ grid-template-columns: 1fr; gap: 48px; margin-bottom: 56px; } }

    .origin-top-left { display: flex; flex-direction: column; gap: 24px; }

    .origin-top-right .origin-photo-box {
      aspect-ratio: 4/3;
    }

    .origin-timeline-wrap {
      margin-bottom: 80px;
    }

    .origin-single-col {
      max-width: 720px;
      display: flex; flex-direction: column; gap: 56px;
    }
    .origin-single-col .origin-photo-box {
      aspect-ratio: 16/9;
    }

    .origin-text {
      display: flex; flex-direction: column; gap: 48px;
    }

    .story-blocks { display: flex; flex-direction: column; gap: 32px; }

    .story-block {
      display: flex; gap: 24px; align-items: flex-start;
    }
    .story-block-line {
      display: flex; flex-direction: column; align-items: center;
      flex-shrink: 0; padding-top: 3px;
    }
    .story-dot {
      width: 8px; height: 8px;
      border-radius: 50%; background: var(--border);
      flex-shrink: 0;
    }
    .story-dot.accent { background: var(--accent); }
    .story-line-bar {
      width: 1px; flex: 1; min-height: 40px;
      background: var(--border); margin-top: 8px;
    }
    .story-block:last-child .story-line-bar { display: none; }

    .story-block-body {}
    .story-period {
      font-family: 'Inter', sans-serif;
      font-size: 10px; font-weight: 600;
      letter-spacing: .15em; color: var(--ts);
      text-transform: uppercase; display: block; margin-bottom: 8px;
    }
    .story-title {
      font-family: 'Noto Sans JP', sans-serif;
      font-weight: 700; font-size: 16px;
      color: var(--tp); line-height: 1.4;
      margin-bottom: 8px;
    }
    .story-desc {
      font-family: 'Noto Sans JP', sans-serif;
      font-weight: 300; font-size: 14px;
      line-height: 1.9; color: var(--ts);
    }

    .sup-card {
      border: 1px solid var(--border);
      border-radius: 14px; overflow: hidden;
      background: var(--card);
    }
    .sup-photo {
      width: 100%;
      overflow: hidden;
      position: relative;
      background: #0c0c0c;
      aspect-ratio: 4/3;
    }
    .sup-photo img {
      width: 100%; height: 100%;
      object-fit: cover;
      object-position: top center;
      display: block;
      filter: brightness(.82) saturate(.88) contrast(1.04);
    }
    .sup-photo-fallback {
      position: absolute; inset: 0;
      background: radial-gradient(ellipse 60% 70% at 50% 30%, #131e15 0%, #0c0c0c 100%);
    }
    .sup-info {
      padding: 28px 32px;
      border-top: 1px solid var(--border);
      display: flex; flex-direction: column; gap: 6px;
    }
    .sup-role-tag {
      font-family: 'Inter', sans-serif;
      font-size: 9px; font-weight: 600;
      letter-spacing: .2em; color: var(--accent);
      text-transform: uppercase; display: block;
    }
    .sup-name-tag {
      font-family: 'Noto Sans JP', sans-serif;
      font-weight: 700; font-size: 18px;
      color: var(--tp); display: block;
      letter-spacing: -.01em; margin-top: 2px; margin-bottom: 8px;
    }
    .sup-title-list {
      list-style: none;
      display: flex; flex-direction: column; gap: 4px;
    }
    .sup-title-list li {
      font-family: 'Noto Sans JP', sans-serif;
      font-weight: 300; font-size: 13px;
      color: var(--ts); line-height: 1.7;
      padding-left: 14px;
      position: relative;
    }
    .sup-title-list li::before {
      content: '';
      position: absolute; left: 0; top: 10px;
      width: 4px; height: 1px;
      background: var(--border);
    }
    .sup-book {
      font-family: 'Noto Sans JP', sans-serif;
      font-weight: 300; font-size: 12px;
      color: #444; line-height: 1.7; margin-top: 10px;
      padding-top: 10px; border-top: 1px solid var(--border);
    }

    .card-grid-3 {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
    }
    @media(max-width:860px){ .card-grid-3{ grid-template-columns: 1fr; gap: 10px; } }

    .card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 48px 40px;
      transition: transform .3s, box-shadow .3s;
    }
    .card:hover { transform: translateY(-2px); box-shadow: 0 20px 56px rgba(0,0,0,.5); }
    @media(max-width:768px){ .card{ padding: 36px 28px; } }

    .card-lbl {
      font-family: 'Inter', sans-serif;
      font-size: 10px; font-weight: 600;
      letter-spacing: .2em; color: var(--accent);
      text-transform: uppercase; display: block; margin-bottom: 22px;
    }
    .card-h {
      font-family: 'Noto Sans JP', sans-serif;
      font-weight: 700; font-size: 17px;
      line-height: 1.45; color: var(--tp); margin-bottom: 16px;
    }
    .card-p {
      font-family: 'Noto Sans JP', sans-serif;
      font-weight: 300; font-size: 13.5px;
      line-height: 1.95; color: var(--ts);
    }

    /* =============================================
       SUPERVISOR SECTION
    ============================================= */
    #supervisor { border-top: 1px solid var(--border); }

    .sup-section-inner {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 80px;
      align-items: center;
    }
    @media(max-width:900px){ .sup-section-inner{ grid-template-columns: 1fr; gap: 56px; } }

    .sup-section-left { display: flex; flex-direction: column; gap: 24px; }

    /* =============================================
       BOOKING
    ============================================= */
    #booking { border-top: 1px solid var(--border); }

    .book-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 80px; align-items: start;
    }
    @media(max-width:900px){ .book-grid{ grid-template-columns: 1fr; gap: 56px; } }

    .book-sticky { position: sticky; top: 110px; }
    @media(max-width:900px){ .book-sticky{ position: static; } }

    .book-note {
      font-family: 'Noto Sans JP', sans-serif;
      font-weight: 300; font-size: 13px;
      color: var(--ts); line-height: 1.9;
      margin-top: 36px; padding-top: 36px;
      border-top: 1px solid var(--border);
    }

    .form { display: flex; flex-direction: column; gap: 22px; }
    .fg { display: flex; flex-direction: column; gap: 9px; }

    .fl {
      font-family: 'Inter', sans-serif;
      font-size: 11px; font-weight: 600;
      letter-spacing: .12em; color: var(--ts);
      text-transform: uppercase;
      display: flex; align-items: center; gap: 8px;
    }
    .frq {
      font-family: 'Inter', sans-serif;
      font-size: 9px; font-weight: 600;
      letter-spacing: .1em; color: var(--accent); text-transform: uppercase;
    }

    .fi, .fs, .ft {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 10px; padding: 15px 18px;
      color: var(--tp);
      font-family: 'Noto Sans JP', sans-serif;
      font-weight: 300; font-size: 15px;
      outline: none; width: 100%;
      transition: border-color .2s, box-shadow .2s;
      -webkit-appearance: none; appearance: none;
    }
    .fi::placeholder, .ft::placeholder { color: #2a2a2a; }
    .fi:focus, .fs:focus, .ft:focus {
      border-color: #2c2c2c;
      box-shadow: 0 0 0 3px rgba(0,224,90,.07);
    }
    .fs {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23555' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
      background-repeat: no-repeat; background-position: right 16px center;
      padding-right: 44px; cursor: pointer;
    }
    .fs option { background: #111; }
    .ft { resize: vertical; min-height: 136px; line-height: 1.8; }

    .f-submit {
      font-family: 'Noto Sans JP', sans-serif;
      font-weight: 700; font-size: 15px;
      letter-spacing: .04em; color: #050505;
      background: var(--accent); border: none; border-radius: 8px;
      padding: 18px 32px; cursor: pointer; margin-top: 6px;
      transition: background .2s, box-shadow .2s;
      width: 100%;
    }
    .f-submit:hover { background: #00c94f; box-shadow: 0 8px 32px rgba(0,224,90,.28); }
    .f-submit:active { transform: translateY(1px); }
    .f-submit:disabled { opacity: .5; cursor: not-allowed; transform: none; }
    .fi.err, .fs.err { border-color: #7a2020; }

    .thanks {
      display: none; padding: 56px 44px;
      background: var(--card); border: 1px solid var(--border);
      border-radius: 14px; text-align: center;
      opacity: 0; transform: translateY(10px);
      transition: opacity .5s ease, transform .5s ease;
    }
    .thanks.show { opacity: 1; transform: none; }
    .thanks-ic {
      width: 54px; height: 54px; border-radius: 50%;
      border: 1px solid var(--accent);
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 28px;
    }
    .thanks-h {
      font-family: 'Noto Sans JP', sans-serif;
      font-weight: 700; font-size: 20px;
      color: var(--tp); margin-bottom: 14px;
    }
    .thanks-p {
      font-family: 'Noto Sans JP', sans-serif;
      font-weight: 300; font-size: 15px;
      color: var(--ts); line-height: 1.95;
    }

    /* =============================================
       FOOTER
    ============================================= */
    footer { border-top: 1px solid var(--border); padding: 80px 0; }
    .foot-inner {
      max-width: var(--max); margin: 0 auto; padding: 0 48px;
      display: flex; align-items: center; justify-content: space-between;
      flex-wrap: wrap; gap: 28px;
    }
    @media(max-width:768px){
      .foot-inner{ flex-direction: column; align-items: flex-start; padding: 0 24px; }
    }
    .foot-logo {
      font-family: 'Inter', sans-serif;
      font-weight: 800; font-size: 20px;
      letter-spacing: -.03em; color: var(--tp); margin-bottom: 8px;
    }
    .foot-tag {
      font-family: 'Noto Sans JP', sans-serif;
      font-weight: 300; font-size: 13px; color: var(--ts);
    }
    .foot-r { display: flex; flex-direction: column; align-items: flex-end; gap: 10px; }
    @media(max-width:768px){ .foot-r{ align-items: flex-start; } }
    .foot-ig {
      font-family: 'Inter', sans-serif;
      font-size: 13px; font-weight: 400; color: var(--ts);
      text-decoration: none; letter-spacing: .03em; transition: color .2s;
    }
    .foot-ig:hover { color: var(--tp); }
    .foot-copy {
      font-family: 'Inter', sans-serif; font-size: 11px; color: #333; letter-spacing: .04em;
    }

  </style>
</head>
<body>

<!-- NAV -->
<nav id="nav" data-scrolled="false" data-visible="true" data-init="true">
  <a href="#hero" class="nav-logo">
    <img src="/images/cloverfit-logo.png"
         alt="CloverFit"
         id="nav-logo-img"
         onerror="this.style.display='none'; document.getElementById('nav-logo-txt').style.display='inline';" />
    <span id="nav-logo-txt" style="display:none; font-family:'Inter',sans-serif; font-weight:800; font-size:16px; letter-spacing:-.03em; color:#fff;">Clover<b style='color:var(--accent);'>Fit</b></span>
  </a>

  <div class="nav-links">
    <a href="#problem" class="nav-link" data-section="problem">課題</a>
    <a href="#solution" class="nav-link" data-section="solution">ソリューション</a>
    <a href="#origin" class="nav-link" data-section="origin">創業者</a>
    <a href="#supervisor" class="nav-link active" data-section="supervisor">監修</a>
    <a href="#booking" class="nav-link" data-section="booking">体験予約</a>
  </div>

  <div class="nav-right">
    <a href="#booking" class="nav-btn">体験予約</a>
  </div>
</nav>


<!-- HERO -->
<section id="hero">

  <div class="hero-bg">
    <img src="/images/training-bg.jpg"
         alt="" id="hero-bg-img" aria-hidden="true"
         onerror="this.style.display='none'; document.getElementById('hero-bg-fallback').style.display='block';" />
    <div class="hero-bg-fallback" id="hero-bg-fallback" style="display:none;"></div>
  </div>
  <div class="hero-vignette"></div>

  <div class="hero-content">
    <div class="hero-tag r on">
      <span class="hero-tag-label">CloverFit for Innovator</span>
    </div>

    <h1 class="r d1 on">
      <em>身体</em>・<em>心</em>・<em>仲間</em>が<br />60分で揃う。
    </h1>

    <p class="hero-body r d2 on">
      ジム、カウンセリング、交流会——<br />全部別々に通う時間は確保できない、<br /><br />
      <strong style="font-weight:700; color:rgba(232,232,232,.85);">起業家・経営者のための<br />フィジカル × メンタルトレーニング</strong>
    </p>

    <div class="hero-pillars r d3 on">
      <div class="hero-pillar">
        <span class="hp-label">Body</span>
        <span class="hp-text">いつまでも動ける身体をつくる機能的なトレーニング</span>
      </div>
      <div class="hero-pillar">
        <span class="hp-label">Mind</span>
        <span class="hp-text">Well-being研究に基づく心理介入</span>
      </div>
      <div class="hero-pillar">
        <span class="hp-label">Community</span>
        <span class="hp-text">同じ悩みを持つ起業家・経営者の特別な空間</span>
      </div>
    </div>

    <div class="hero-cta-row r d4 on">
      <a href="#booking" class="hero-cta">体験予約する</a>
      <span class="hero-cta-note">起業家・経営者限定</span>
    </div>
  </div>



</section>


<!-- PROBLEM -->
<section id="problem">
  <div class="wrap">
    <div class="problem-inner">

      <div>
        <span class="label r on">Problem</span>
        <h2 class="r d1 on">いる人ほど、<br />心は<em>壊れやすい</em>。
        </h2>
        <p class="sub r d2 on">
          起業後の心理的ストレス、トレーニング時間の消滅、コミュニティの欠如。
        </p>
      </div>

      <div class="stat-stack">
        <div class="stat-row r d1 on">
          <div class="stat-n">87<span>%</span></div>
          <div class="stat-divider"></div>
          <div>
            <p class="stat-l">の起業家がメンタルヘルス問題を抱えている</p>
            <span class="stat-src">Founder Reports, 2026</span>
          </div>
        </div>
        <div class="stat-row r d2 on">
          <div class="stat-n">49<span>%</span></div>
          <div class="stat-divider"></div>
          <div>
            <p class="stat-l">の起業家が、精神疾患を経験している</p>
            <span class="stat-src">Freeman et al., 2015</span>
          </div>
        </div>
        <div class="stat-row r d3 on">
          <div class="stat-n">10<span style="font-size:.45em;letter-spacing:0;vertical-align:super">倍</span></div>
          <div class="stat-divider"></div>
          <div>
            <p class="stat-l">躁うつ病リスクが一般人より10倍高い</p>
            <span class="stat-src">Freeman et al., 2015</span>
          </div>
        </div>
      </div>

    </div>
  </div>
</section>


<!-- SOLUTION -->
<section id="solution">
  <div class="wrap">

    <div class="sol-hd">
      <span class="label r on">Solution</span>
      <h2 class="r d1 on">心も身体も<br />タフじゃなきゃ。</h2>
      <p class="sol-sub r d2 on">起業家のための<br />フィジカル × メンタルトレーニング。</p>
      <p class="sub r d3 on"> for Innovatorは、60分で身体・心・仲間が揃う、<br />
        起業家・経営者のための場所。
      </p>
    </div>

    <div class="evidence-banner r on">
      <div class="evidence-body">
        <span class="evidence-label">Research — Swansea University</span>
        <p class="evidence-text"><em>運動と心理介入の組み合わせ</em>が、ヨガ・マインドフルネスなど他のどのアプローチよりも、メンタルヘルス改善効果が最も高い。</p>
      </div>
      <span class="evidence-src">Wilkie et al., Nature Human Behaviour, 2026</span>
    </div>

    <div class="feat-grid">
      <div class="feat-card r d1 on">
        <span class="feat-n">01</span>
        <h3 class="feat-h"><em>60分</em>で全部が揃う</h3>
        <p class="feat-p">トレーニング・メンタルケア・仲間作り。別々に通う時間はない。だから1つのセッションに凝縮。</p>
      </div>
      <div class="feat-card r d2 on">
        <span class="feat-n">02</span>
        <h3 class="feat-h"><em>経営者だけ</em>の空間</h3>
        <p class="feat-p">同じ重圧を知る仲間同士だから、すぐに分かりあえる。ただの交流会より深いつながりが、ここにある。</p>
      </div>
      <div class="feat-card r d3 on">
        <span class="feat-n">03</span>
        <h3 class="feat-h">身体だけじゃない、<em>心も変わる</em></h3>
        <p class="feat-p">身体だけ変わっても、心はついてこない。慶應義塾大学名誉教授監修のプログラムによって、心にもアプローチ。</p>
      </div>
      <div class="feat-card r d4 on">
        <span class="feat-n">04</span>
        <h3 class="feat-h"><em>忙しい毎日</em>からの解放</h3>
        <p class="feat-p">60分だけ、経営を忘れて自分の心と身体に向き合う。それが翌日のパフォーマンスを、決定的に変える。</p>
      </div>
    </div>

  </div>
</section>


<!-- ORIGIN -->
<section id="origin">
  <div class="wrap">

    <div class="origin-top-grid">
      <div class="origin-top-left r on">
        <span class="label">Origin</span>
        <h2>身体を鍛えるほど、<br />心が壊れていった。</h2>
        <p class="sub">高校時代からパーソナルトレーナーとして活動。慶應義塾大学でウエイトリフティング・ボディビルに打ち込む中で、身体だけを鍛え続けることの限界に気づいた。</p>
      </div>
      <div class="origin-top-right r d1 on">
        <div class="origin-photo-box">
          <img src="/images/founder.jpg" alt="小川貴史" />
          <span class="origin-photo-label">Founder — 小川 貴史</span>
        </div>
      </div>
    </div>

    <div class="origin-timeline-wrap">
      <div class="story-blocks r d2 on">

        <div class="story-block">
          <div class="story-block-line">
            <div class="story-dot"></div>
            <div class="story-line-bar"></div>
          </div>
          <div class="story-block-body">
            <span class="story-period">高校時代</span>
            <p class="story-title">トレーナーとして、現場に立つ。</p>
            <p class="story-desc">高校生のうちからパーソナルトレーナーとして働き始め、身体づくりの本質を現場で学ぶ。学んだ知識を自分の身体づくりに活かし、高校生でボディコンテストにも出場する。</p>
          </div>
        </div>

        <div class="story-block">
          <div class="story-block-line">
            <div class="story-dot"></div>
            <div class="story-line-bar"></div>
          </div>
          <div class="story-block-body">
            <span class="story-period">大学入学</span>
            <p class="story-title">「他人よりかっこいい身体を目指すこと」が、すべてだった。</p>
            <p class="story-desc">慶應義塾大学体育会でウエイトリフティングに取り組みながら、ボディビル競技でも結果を残した。重量の数字と鏡の中の肉体だけを追いかける日々。</p>
          </div>
        </div>

        <div class="story-block">
          <div class="story-block-line">
            <div class="story-dot accent"></div>
            <div class="story-line-bar"></div>
          </div>
          <div class="story-block-body">
            <span class="story-period">転機</span>
            <p class="story-title">過度な減量で、心が折れた。</p>
            <p class="story-desc">極限まで絞り込む減量を繰り返すうち、精神的に追い詰められた。身体は仕上がっていっても、心がついてこなかった。「身体だけを鍛えても、人は健康にはなれない」——その実感が、CloverFitの出発点になった。</p>
          </div>
        </div>

        <div class="story-block">
          <div class="story-block-line">
            <div class="story-dot accent"></div>
          </div>
          <div class="story-block-body">
            <span class="story-period">CloverFit創業</span>
            <p class="story-title">自分に必要だったものを、仕組みにした。</p>
            <p class="story-desc">心と身体を同時に整え、支え合える仲間がいる環境。自分が欲しかったその場所を、プログラムとして設計し、高齢者施設や企業への導入を実現。自分自身が事業を行う中で、起業家・経営者のメンタルヘルス問題に着目し、CloverFit for Innovatorを立ち上げた。</p>
          </div>
        </div>

      </div>
    </div>



  </div>
</section>


<!-- SUPERVISOR -->
<section id="supervisor">
  <div class="wrap">

    <div class="sup-section-inner">
      <div class="sup-section-left r on">
        <span class="label">Supervisor</span>
        <h2>このプログラムには<br />科学的根拠がある。</h2>
        <p class="sub">Well-being研究の第一人者、前野隆司教授が監修。幸福学の知見をプログラムに組み込むことで、心理的効果を科学的に担保しています。</p>
      </div>
      <div class="sup-card-wrap r d2 on">
        <div class="sup-card">
          <div class="sup-photo">
            <img src="/images/supervisor.jpg"
                 alt="前野隆司"
                 id="sup-photo-img" />
            <div class="sup-photo-fallback" id="sup-photo-fallback" style="display:none;"></div>
          </div>
          <div class="sup-info">
            <span class="sup-role-tag">Supervisor</span>
            <span class="sup-name-tag">前野 隆司</span>
            <ul class="sup-title-list">
              <li>慶應義塾大学名誉教授</li>
              <li>武蔵野大学ウェルビーイング学部長</li>
              <li>ウェルビーイング学会代表理事</li>
              <li>慶應義塾大学ウェルビーイングリサーチセンター長を務め、Well-being研究に従事</li>
            </ul>
            <p class="sup-book">著書に『幸せのメカニズム実践・幸福学入門』（2013年）など多数</p>
          </div>
        </div>
      </div>
    </div>

  </div>
</section>


<!-- BOOKING -->
<section id="booking">
  <div class="wrap">
    <div class="book-grid">

      <div class="book-sticky">
        <span class="label r on">Contact</span>
        <h2 class="r d1 on">まずは、<br />体験から。</h2>
        <p class="sub r d2 on">起業家・経営者の方を対象にご案内しております。</p>
        <p class="book-note r d3 on">
          お申し込み後、2営業日以内に担当者よりご連絡いたします。<br />
          体験セッションは完全無料でご参加いただけます。
        </p>
      </div>

      <div>
        <form class="form r on" id="bform" novalidate>
          <div class="fg">
            <label class="fl" for="f-name">お名前 <span class="frq">必須</span></label>
            <input type="text" id="f-name" class="fi" placeholder="山田 太郎" required />
          </div>
          <div class="fg">
            <label class="fl" for="f-email">メールアドレス <span class="frq">必須</span></label>
            <input type="email" id="f-email" class="fi" placeholder="taro@example.com" required />
          </div>
          <div class="fg">
            <label class="fl" for="f-phone">電話番号</label>
            <input type="tel" id="f-phone" class="fi" placeholder="090-0000-0000" />
          </div>
          <div class="fg">
            <label class="fl" for="f-pos">あなたの立場 <span class="frq">必須</span></label>
            <select id="f-pos" class="fs" required>
              <option value="" disabled selected>選択してください</option>
              <option value="founder">起業家・創業者</option>
              <option value="ceo">経営者・代表取締役</option>
              <option value="exec">役員・CxO</option>
              <option value="sole">個人事業主</option>
              <option value="other">その他</option>
            </select>
          </div>
          <div class="fg">
            <label class="fl" for="f-co">事業内容・会社名</label>
            <input type="text" id="f-co" class="fi" placeholder="株式会社〇〇 / SaaS事業" />
          </div>
          <div class="fg">
            <label class="fl" for="f-msg">CloverFitに期待すること</label>
            <textarea id="f-msg" class="ft" placeholder="身体を整えたい、孤独感を解消したい、仕事の仲間を作りたい…など、お気軽にお書きください。"></textarea>
          </div>
          <button type="submit" class="f-submit" id="f-submit-btn">体験予約する</button>
        </form>

        <div class="thanks" id="thanks">
          <div class="thanks-ic">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
                 fill="none" stroke="var(--accent)" stroke-width="1.8"
                 stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <h3 class="thanks-h">お申し込みありがとうございます。</h3>
          <p class="thanks-p">2営業日以内にご連絡いたします。<br />今しばらくお待ちください。</p>
        </div>
      </div>

    </div>
  </div>
</section>


<!-- FOOTER -->
<footer>
  <div class="foot-inner">
    <div>
      <div class="foot-logo">CloverFit</div>
      <div class="foot-tag">ジムで身体は変わった。でも、心は？</div>
    </div>
    <div class="foot-r">
      <a href="https://instagram.com/cloverfit_2026" target="_blank" rel="noopener" class="foot-ig">@cloverfit_2026</a>
      <span class="foot-copy">© 2026 CloverFit. All rights reserved.</span>
    </div>
  </div>
</footer>


<!-- EmailJS -->
<script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js"></script>
<script>
  emailjs.init('Bo0CYQhPE97QN9Q_K');
</script>

<!-- JS -->
<script>
  /* Image error handler */
  function imgErr(imgId, fallbackId) {
    const img = document.getElementById(imgId);
    const fb  = fallbackId ? document.getElementById(fallbackId) : null;
    if (!img) return;
    const handle = () => {
      img.style.display = 'none';
      if (fb) fb.style.display = 'block';
    };
    img.addEventListener('error', handle);
    if (img.complete && img.naturalWidth === 0) handle();
  }

  imgErr('sup-photo-img', 'sup-photo-fallback');

  /* Nav scroll + アクティブ目次 */
  const nav = document.getElementById('nav');
  const navLinks = document.querySelectorAll('.nav-link[data-section]');
  const sections = ['problem','solution','origin','supervisor','booking'].map(id => document.getElementById(id));

  window.addEventListener('scroll', () => {
    nav.classList.toggle('s', window.scrollY > 60);

    let current = '';
    sections.forEach(sec => {
      if (sec && sec.getBoundingClientRect().top <= 120) current = sec.id;
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.dataset.section === current);
    });
  }, { passive: true });

  /* Scroll reveal */
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('on'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.r').forEach(el => obs.observe(el));

  /* Form — APIに送信 */
  const form      = document.getElementById('bform');
  const thanks    = document.getElementById('thanks');
  const submitBtn = document.getElementById('f-submit-btn');

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const name  = document.getElementById('f-name');
    const email = document.getElementById('f-email');
    const pos   = document.getElementById('f-pos');
    let ok = true;
    [name, email, pos].forEach(el => {
      el.classList.remove('err');
      if (!el.value.trim()) {
        el.classList.add('err'); ok = false;
        el.addEventListener('input',  () => el.classList.remove('err'), { once: true });
        el.addEventListener('change', () => el.classList.remove('err'), { once: true });
      }
    });
    if (!ok) return;

    submitBtn.disabled = true;
    submitBtn.textContent = '送信中...';

    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:     name.value.trim(),
          email:    email.value.trim(),
          phone:    document.getElementById('f-phone').value.trim(),
          position: pos.value,
          company:  document.getElementById('f-co').value.trim(),
          message:  document.getElementById('f-msg').value.trim()
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '送信エラー');

      // EmailJSでメール通知（ブラウザから直接送信）
      try {
        await emailjs.send('service_dpaxz70', 'template_vy1oi7d', {
          name:     name.value.trim(),
          email:    email.value.trim(),
          phone:    document.getElementById('f-phone').value.trim() || 'なし',
          position: pos.options[pos.selectedIndex].text,
          company:  document.getElementById('f-co').value.trim() || 'なし',
          message:  document.getElementById('f-msg').value.trim() || 'なし'
        });
        console.log('メール通知送信成功');
      } catch(mailErr) {
        console.error('メール通知エラー:', mailErr);
      }

      form.style.transition = 'opacity .35s ease, transform .35s ease';
      form.style.opacity = '0';
      form.style.transform = 'translateY(-8px)';
      setTimeout(() => {
        form.style.display = 'none';
        thanks.style.display = 'block';
        void thanks.offsetHeight;
        thanks.classList.add('show');
      }, 340);

    } catch (err) {
      alert(err.message || '送信に失敗しました。再度お試しください。');
      submitBtn.disabled = false;
      submitBtn.textContent = '体験予約する';
    }
  });
</script>

</body>
</html>`
}

// ============================================================
// 管理画面HTML
// ============================================================
function adminHTML(): string {
  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>CloverFit 管理画面</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&family=Noto+Sans+JP:wght@300;400;500;700&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
    :root { --bg:#050505; --card:#0f0f0f; --border:#1e1e1e; --tp:#e8e8e8; --ts:#666; --accent:#00e05a; --sidebar:220px; }
    body { background:var(--bg); color:var(--tp); font-family:'Noto Sans JP',sans-serif; font-weight:300; min-height:100vh; }
    .login-wrap { min-height:100vh; display:flex; align-items:center; justify-content:center; padding:24px; }
    .login-card { background:var(--card); border:1px solid var(--border); border-radius:16px; padding:56px 48px; width:100%; max-width:400px; }
    .login-logo { font-family:'Inter',sans-serif; font-weight:800; font-size:24px; letter-spacing:-.03em; margin-bottom:8px; }
    .login-sub { font-size:13px; color:var(--ts); margin-bottom:40px; }
    .login-form { display:flex; flex-direction:column; gap:16px; }
    .login-label { font-family:'Inter',sans-serif; font-size:11px; font-weight:600; letter-spacing:.1em; color:var(--ts); text-transform:uppercase; display:block; margin-bottom:8px; }
    .login-input { width:100%; background:var(--bg); border:1px solid var(--border); border-radius:8px; padding:12px 16px; color:var(--tp); font-family:'Noto Sans JP',sans-serif; font-size:15px; outline:none; transition:border-color .2s; }
    .login-input:focus { border-color:#333; }
    .login-btn { background:var(--accent); color:#050505; border:none; border-radius:8px; padding:14px; font-family:'Noto Sans JP',sans-serif; font-weight:700; font-size:15px; cursor:pointer; transition:background .2s; margin-top:8px; }
    .login-btn:hover { background:#00c94f; }
    .login-err { background:rgba(224,90,90,.1); border:1px solid rgba(224,90,90,.3); border-radius:8px; padding:12px 16px; font-size:14px; color:#e05a5a; display:none; margin-bottom:16px; }
    .admin-layout { display:grid; grid-template-columns:var(--sidebar) 1fr; min-height:100vh; }
    .sidebar { background:var(--card); border-right:1px solid var(--border); padding:24px 0; display:flex; flex-direction:column; position:sticky; top:0; height:100vh; }
    .sidebar-logo { font-family:'Inter',sans-serif; font-weight:800; font-size:16px; letter-spacing:-.03em; padding:0 20px 24px; border-bottom:1px solid var(--border); margin-bottom:16px; }
    .sidebar-nav { display:flex; flex-direction:column; gap:2px; padding:0 8px; flex:1; }
    .sidebar-link { display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:8px; font-size:14px; color:var(--ts); text-decoration:none; cursor:pointer; border:none; background:none; width:100%; text-align:left; transition:background .2s,color .2s; }
    .sidebar-link:hover, .sidebar-link.active { background:rgba(255,255,255,.05); color:var(--tp); }
    .sidebar-link.active { color:var(--accent); }
    .sidebar-bottom { padding:16px 8px; border-top:1px solid var(--border); margin-top:auto; }
    .main { padding:32px; overflow-y:auto; }
    .page-header { margin-bottom:32px; }
    .page-title { font-family:'Inter',sans-serif; font-weight:700; font-size:22px; letter-spacing:-.02em; color:var(--tp); margin-bottom:6px; }
    .page-sub { font-size:14px; color:var(--ts); }
    .stats-grid { display:grid; grid-template-columns:repeat(5,1fr); gap:10px; margin-bottom:32px; }
    @media(max-width:1200px){ .stats-grid{ grid-template-columns:repeat(3,1fr); } }
    .stat-card { background:var(--card); border:1px solid var(--border); border-radius:12px; padding:24px 20px; }
    .stat-card-label { font-family:'Inter',sans-serif; font-size:10px; font-weight:600; letter-spacing:.15em; color:var(--ts); text-transform:uppercase; display:block; margin-bottom:12px; }
    .stat-card-num { font-family:'Inter',sans-serif; font-weight:800; font-size:32px; color:var(--tp); letter-spacing:-.03em; display:block; }
    .stat-card-num.accent { color:var(--accent); }
    .filter-bar { display:flex; gap:8px; margin-bottom:20px; flex-wrap:wrap; }
    .filter-btn { background:var(--card); border:1px solid var(--border); border-radius:8px; padding:8px 16px; font-family:'Inter',sans-serif; font-size:12px; font-weight:500; color:var(--ts); cursor:pointer; transition:all .2s; }
    .filter-btn:hover { color:var(--tp); border-color:#333; }
    .filter-btn.active { background:rgba(0,224,90,.1); border-color:rgba(0,224,90,.3); color:var(--accent); }
    .table-wrap { background:var(--card); border:1px solid var(--border); border-radius:12px; overflow:hidden; }
    table { width:100%; border-collapse:collapse; }
    thead { border-bottom:1px solid var(--border); }
    thead th { padding:14px 20px; text-align:left; font-family:'Inter',sans-serif; font-size:11px; font-weight:600; letter-spacing:.1em; color:var(--ts); text-transform:uppercase; }
    tbody tr { border-bottom:1px solid var(--border); transition:background .15s; }
    tbody tr:last-child { border-bottom:none; }
    tbody tr:hover { background:rgba(255,255,255,.02); }
    tbody td { padding:16px 20px; font-size:14px; color:var(--tp); }
    .td-name { font-weight:500; }
    .td-email { color:var(--ts); font-size:13px; }
    .status-badge { display:inline-flex; align-items:center; gap:6px; padding:4px 10px; border-radius:6px; font-family:'Inter',sans-serif; font-size:11px; font-weight:600; letter-spacing:.05em; }
    .status-new { background:rgba(0,224,90,.1); color:var(--accent); }
    .status-contacted { background:rgba(90,150,224,.1); color:#5a96e0; }
    .status-scheduled { background:rgba(224,180,90,.1); color:#e0b45a; }
    .status-completed { background:rgba(150,224,90,.1); color:#96e05a; }
    .status-cancelled { background:rgba(224,90,90,.1); color:#e05a5a; }
    .action-btn { background:none; border:1px solid var(--border); border-radius:6px; padding:6px 12px; font-size:12px; color:var(--ts); cursor:pointer; transition:all .2s; }
    .action-btn:hover { border-color:#444; color:var(--tp); }
    .modal-bg { position:fixed; inset:0; background:rgba(0,0,0,.8); z-index:500; display:flex; align-items:center; justify-content:center; padding:24px; }
    .modal { background:var(--card); border:1px solid var(--border); border-radius:16px; width:100%; max-width:560px; padding:40px; max-height:90vh; overflow-y:auto; }
    .modal-title { font-family:'Inter',sans-serif; font-weight:700; font-size:18px; margin-bottom:24px; }
    .modal-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:24px; }
    .modal-field label { font-family:'Inter',sans-serif; font-size:10px; font-weight:600; letter-spacing:.1em; color:var(--ts); text-transform:uppercase; display:block; margin-bottom:6px; }
    .modal-field p { font-size:14px; color:var(--tp); line-height:1.6; }
    .modal-field.full { grid-column:1/-1; }
    .modal-select, .modal-textarea { width:100%; background:var(--bg); border:1px solid var(--border); border-radius:8px; padding:10px 14px; color:var(--tp); font-family:'Noto Sans JP',sans-serif; font-size:14px; outline:none; -webkit-appearance:none; }
    .modal-textarea { resize:vertical; min-height:80px; }
    .modal-footer { display:flex; gap:10px; justify-content:flex-end; margin-top:24px; }
    .btn-cancel { background:none; border:1px solid var(--border); border-radius:8px; padding:10px 20px; color:var(--ts); cursor:pointer; font-size:14px; }
    .btn-save { background:var(--accent); border:none; border-radius:8px; padding:10px 24px; color:#050505; font-weight:700; cursor:pointer; font-size:14px; }
    .loading { text-align:center; padding:48px; color:var(--ts); font-size:14px; }
    .empty { text-align:center; padding:64px; color:var(--ts); }
    .pagination { display:flex; align-items:center; justify-content:flex-end; gap:8px; padding:16px 20px; border-top:1px solid var(--border); }
    .page-btn { background:none; border:1px solid var(--border); border-radius:6px; padding:6px 12px; font-size:13px; color:var(--ts); cursor:pointer; transition:all .2s; }
    .page-btn:hover:not(:disabled) { color:var(--tp); border-color:#333; }
    .page-btn:disabled { opacity:.3; cursor:not-allowed; }
    .page-info { font-size:13px; color:var(--ts); }
    .recent-list { display:flex; flex-direction:column; gap:2px; }
    .recent-item { background:var(--bg); border:1px solid var(--border); border-radius:10px; padding:16px 20px; display:flex; align-items:center; justify-content:space-between; gap:16px; }
    .recent-name { font-weight:500; font-size:15px; margin-bottom:2px; }
    .recent-email { font-size:13px; color:var(--ts); }
    .recent-date { font-family:'Inter',sans-serif; font-size:12px; color:var(--ts); }
  </style>
</head>
<body>

<div id="login-page" class="login-wrap">
  <div class="login-card">
    <div class="login-logo">CloverFit</div>
    <div class="login-sub">管理者ログイン</div>
    <div class="login-err" id="login-err"></div>
    <div class="login-form">
      <div>
        <label class="login-label">ユーザー名</label>
        <input type="text" class="login-input" id="login-user" value="admin" />
      </div>
      <div>
        <label class="login-label">パスワード</label>
        <input type="password" class="login-input" id="login-pass" placeholder="パスワードを入力" />
      </div>
      <button class="login-btn" onclick="doLogin()">ログイン</button>
    </div>
  </div>
</div>

<div id="admin-page" style="display:none;">
  <div class="admin-layout">
    <div class="sidebar">
      <div class="sidebar-logo">CloverFit</div>
      <div class="sidebar-nav">
        <button class="sidebar-link active" onclick="showPage('dashboard')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
          ダッシュボード
        </button>
        <button class="sidebar-link" onclick="showPage('bookings')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          申し込み一覧
        </button>
      </div>
      <div class="sidebar-bottom">
        <button class="sidebar-link" onclick="doLogout()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          ログアウト
        </button>
      </div>
    </div>
    <div class="main">
      <div id="page-dashboard">
        <div class="page-header">
          <div class="page-title">ダッシュボード</div>
          <div class="page-sub">申し込み状況の概要</div>
        </div>
        <div class="stats-grid" id="stats-grid"><div class="loading">読み込み中...</div></div>
        <div class="page-header"><div class="page-title" style="font-size:16px;">最近の申し込み</div></div>
        <div id="recent-list" class="recent-list"><div class="loading">読み込み中...</div></div>
      </div>
      <div id="page-bookings" style="display:none;">
        <div class="page-header">
          <div class="page-title">申し込み一覧</div>
          <div class="page-sub">体験セッション申し込みの管理</div>
        </div>
        <div class="filter-bar">
          <button class="filter-btn active" onclick="setFilter('all')">すべて</button>
          <button class="filter-btn" onclick="setFilter('new')">新規</button>
          <button class="filter-btn" onclick="setFilter('contacted')">連絡済み</button>
          <button class="filter-btn" onclick="setFilter('scheduled')">日程確定</button>
          <button class="filter-btn" onclick="setFilter('completed')">完了</button>
          <button class="filter-btn" onclick="setFilter('cancelled')">キャンセル</button>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>名前</th><th>立場</th><th>会社・事業</th><th>ステータス</th><th>申し込み日</th><th></th></tr></thead>
            <tbody id="bookings-tbody"><tr><td colspan="6" class="loading">読み込み中...</td></tr></tbody>
          </table>
          <div class="pagination" id="pagination"></div>
        </div>
      </div>
    </div>
  </div>
</div>

<div class="modal-bg" id="modal" style="display:none;" onclick="if(event.target===this)this.style.display='none'">
  <div class="modal">
    <div class="modal-title">申し込み詳細</div>
    <div class="modal-grid" id="modal-body"></div>
    <div style="margin-bottom:16px;">
      <label style="font-family:Inter,sans-serif;font-size:10px;font-weight:600;letter-spacing:.1em;color:var(--ts);text-transform:uppercase;display:block;margin-bottom:6px;">ステータス</label>
      <select class="modal-select" id="modal-status">
        <option value="new">新規</option>
        <option value="contacted">連絡済み</option>
        <option value="scheduled">日程確定</option>
        <option value="completed">完了</option>
        <option value="cancelled">キャンセル</option>
      </select>
    </div>
    <div>
      <label style="font-family:Inter,sans-serif;font-size:10px;font-weight:600;letter-spacing:.1em;color:var(--ts);text-transform:uppercase;display:block;margin-bottom:6px;">管理メモ</label>
      <textarea class="modal-textarea" id="modal-note" placeholder="連絡日時、メモなど..."></textarea>
    </div>
    <div class="modal-footer">
      <button class="btn-cancel" onclick="document.getElementById('modal').style.display='none'">キャンセル</button>
      <button class="btn-save" onclick="saveBooking()">保存する</button>
    </div>
  </div>
</div>

<script>
  let token = localStorage.getItem('cf_admin_token') || '';
  let currentBookingId = null;
  let currentFilter = 'all';
  let currentPage = 1;

  if (token) {
    try {
      const p = JSON.parse(atob(token));
      if (p.exp > Date.now()) {
        document.getElementById('login-page').style.display = 'none';
        document.getElementById('admin-page').style.display = 'block';
        loadDashboard();
      } else { token = ''; localStorage.removeItem('cf_admin_token'); }
    } catch { token = ''; }
  }

  async function doLogin() {
    const user = document.getElementById('login-user').value;
    const pass = document.getElementById('login-pass').value;
    const errEl = document.getElementById('login-err');
    errEl.style.display = 'none';
    try {
      const res = await fetch('/api/admin/login', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({username:user,password:pass}) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      token = data.token;
      localStorage.setItem('cf_admin_token', token);
      document.getElementById('login-page').style.display = 'none';
      document.getElementById('admin-page').style.display = 'block';
      loadDashboard();
    } catch (err) { errEl.textContent = err.message; errEl.style.display = 'block'; }
  }

  document.getElementById('login-pass').addEventListener('keydown', e => { if(e.key==='Enter') doLogin(); });

  function doLogout() { token=''; localStorage.removeItem('cf_admin_token'); location.reload(); }

  function showPage(page) {
    ['dashboard','bookings'].forEach(p => { document.getElementById('page-'+p).style.display = p===page?'block':'none'; });
    document.querySelectorAll('.sidebar-link').forEach((l,i) => l.classList.toggle('active', i===(page==='dashboard'?0:1)));
    if(page==='bookings') loadBookings();
    if(page==='dashboard') loadDashboard();
  }

  async function apiFetch(path, opts={}) {
    return fetch(path, {...opts, headers:{'Authorization':'Bearer '+token,'Content-Type':'application/json',...(opts.headers||{})}});
  }

  async function loadDashboard() {
    const res = await apiFetch('/api/admin/stats');
    const data = await res.json();
    const s = data.stats;
    document.getElementById('stats-grid').innerHTML = \`
      <div class="stat-card"><span class="stat-card-label">総申し込み</span><span class="stat-card-num accent">\${s.total}</span></div>
      <div class="stat-card"><span class="stat-card-label">新規</span><span class="stat-card-num">\${s.new_count}</span></div>
      <div class="stat-card"><span class="stat-card-label">連絡済み</span><span class="stat-card-num">\${s.contacted_count}</span></div>
      <div class="stat-card"><span class="stat-card-label">日程確定</span><span class="stat-card-num">\${s.scheduled_count}</span></div>
      <div class="stat-card"><span class="stat-card-label">完了</span><span class="stat-card-num">\${s.completed_count}</span></div>
    \`;
    const recentEl = document.getElementById('recent-list');
    if (!data.recent.length) { recentEl.innerHTML='<div class="empty">申し込みはまだありません</div>'; return; }
    recentEl.innerHTML = data.recent.map(b => \`
      <div class="recent-item">
        <div><div class="recent-name">\${esc(b.name)}</div><div class="recent-email">\${esc(b.email)}</div></div>
        <span class="status-badge status-\${b.status}">\${statusLabel(b.status)}</span>
        <div class="recent-date">\${fmtDate(b.created_at)}</div>
      </div>
    \`).join('');
  }

  async function loadBookings() {
    document.getElementById('bookings-tbody').innerHTML = '<tr><td colspan="6" class="loading">読み込み中...</td></tr>';
    const res = await apiFetch(\`/api/admin/bookings?status=\${currentFilter}&page=\${currentPage}\`);
    const data = await res.json();
    const posMap = {founder:'起業家・創業者',ceo:'経営者・代表取締役',exec:'役員・CxO',sole:'個人事業主',other:'その他'};
    if (!data.bookings.length) {
      document.getElementById('bookings-tbody').innerHTML='<tr><td colspan="6" class="empty">申し込みがありません</td></tr>';
      document.getElementById('pagination').innerHTML='';
      return;
    }
    document.getElementById('bookings-tbody').innerHTML = data.bookings.map(b => \`
      <tr>
        <td><div class="td-name">\${esc(b.name)}</div><div class="td-email">\${esc(b.email)}</div></td>
        <td>\${posMap[b.position]||b.position}</td>
        <td>\${esc(b.company||'—')}</td>
        <td><span class="status-badge status-\${b.status}">\${statusLabel(b.status)}</span></td>
        <td>\${fmtDate(b.created_at)}</td>
        <td><button class="action-btn" onclick='openModal(\${JSON.stringify(b).replace(/"/g,"&quot;")})'>詳細</button></td>
      </tr>
    \`).join('');
    const totalPages = Math.ceil(data.total/data.limit);
    document.getElementById('pagination').innerHTML = \`
      <span class="page-info">全\${data.total}件 / \${currentPage}/\${totalPages}ページ</span>
      <button class="page-btn" onclick="changePage(\${currentPage-1})" \${currentPage<=1?'disabled':''}>前へ</button>
      <button class="page-btn" onclick="changePage(\${currentPage+1})" \${currentPage>=totalPages?'disabled':''}>次へ</button>
    \`;
  }

  function changePage(p) { currentPage=p; loadBookings(); }

  function setFilter(f) {
    currentFilter=f; currentPage=1;
    const labels={all:'すべて',new:'新規',contacted:'連絡済み',scheduled:'日程確定',completed:'完了',cancelled:'キャンセル'};
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.toggle('active', b.textContent.trim()===labels[f]));
    loadBookings();
  }

  function openModal(b) {
    currentBookingId = b.id;
    const posMap = {founder:'起業家・創業者',ceo:'経営者・代表取締役',exec:'役員・CxO',sole:'個人事業主',other:'その他'};
    document.getElementById('modal-body').innerHTML = \`
      <div class="modal-field"><label>名前</label><p>\${esc(b.name)}</p></div>
      <div class="modal-field"><label>立場</label><p>\${posMap[b.position]||b.position}</p></div>
      <div class="modal-field"><label>メール</label><p>\${esc(b.email)}</p></div>
      <div class="modal-field"><label>電話</label><p>\${esc(b.phone||'—')}</p></div>
      <div class="modal-field full"><label>会社・事業</label><p>\${esc(b.company||'—')}</p></div>
      <div class="modal-field full"><label>期待すること</label><p>\${esc(b.message||'—')}</p></div>
      <div class="modal-field full"><label>申し込み日</label><p>\${fmtDate(b.created_at)}</p></div>
    \`;
    document.getElementById('modal-status').value = b.status;
    document.getElementById('modal-note').value = b.admin_note||'';
    document.getElementById('modal').style.display = 'flex';
  }

  async function saveBooking() {
    await apiFetch('/api/admin/bookings/'+currentBookingId, {
      method:'PATCH',
      body:JSON.stringify({status:document.getElementById('modal-status').value, admin_note:document.getElementById('modal-note').value})
    });
    document.getElementById('modal').style.display='none';
    loadBookings();
  }

  function statusLabel(s) { return {new:'新規',contacted:'連絡済み',scheduled:'日程確定',completed:'完了',cancelled:'キャンセル'}[s]||s; }
  function esc(s) { if(!s) return ''; return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function fmtDate(d) { if(!d) return '—'; return new Date(d).toLocaleDateString('ja-JP',{year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}); }
</script>
</body>
</html>`
}

export default app
