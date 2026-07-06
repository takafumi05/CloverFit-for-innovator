# CloverFit for Innovator

起業家・経営者のための「フィジカル × メンタルトレーニング」LP + 申し込み管理システム。

**コンセプト**: 「ジムで身体は変わった。でも、心は？」
**ターゲット**: 起業家・経営者（クローズドコミュニティ）

## 技術スタック

- **Next.js 15**（App Router / TypeScript / React 19）
- **Tailwind CSS v4**
- **Cloudflare Workers**（[OpenNext](https://opennext.js.org/cloudflare) `@opennextjs/cloudflare` でホスティング）
- **Cloudflare D1**（申し込み・管理者データ）

## ディレクトリ構成

```
src/
├── app/
│   ├── layout.tsx          # フォント / metadata(SEO・OGP) / globals.css
│   ├── page.tsx           # LP（各セクションを合成）+ JSON-LD
│   ├── globals.css        # Tailwind テーマトークン + スクロールリベール
│   ├── sitemap.ts         # /sitemap.xml
│   ├── robots.ts          # /robots.txt
│   ├── admin/page.tsx     # 管理画面（クライアントSPA）
│   └── api/
│       ├── booking/route.ts
│       └── admin/{login,bookings,bookings/[id],stats}/route.ts
├── components/
│   ├── landing/           # Nav, Hero, Problem, Solution, Origin,
│   │                      # Supervisor, Booking, ContactForm, Footer, ScrollReveal
│   └── admin/AdminApp.tsx
└── lib/                   # db(D1) / auth / email / constants / format
```

設定ファイル（`wrangler.jsonc` / `open-next.config.ts` / `next.config.ts` / `postcss.config.mjs`）・`public/`・`migrations/` はリポジトリ直下。

## 機能

### LP（`/`）
Hero / Problem / Solution / Origin / Supervisor / Booking / Contact の各セクション。
体験予約は公式LINE導線、問い合わせフォームは EmailJS（クライアント送信）。

### API
| メソッド | パス | 説明 |
|---|---|---|
| POST | `/api/booking` | 体験申し込みを D1 保存 + EmailJS 通知 |
| POST | `/api/admin/login` | 管理トークン発行 |
| GET | `/api/admin/bookings` | 申し込み一覧（フィルタ・ページネーション） |
| PATCH | `/api/admin/bookings/:id` | ステータス・メモ更新 |
| GET | `/api/admin/stats` | ダッシュボード統計 |

### 管理画面（`/admin`）
ログイン（`admin` / `cloverfit2026`）→ ダッシュボード統計・申し込み一覧・詳細モーダル・ステータス管理。

## 開発

```bash
npm install
npm run dev          # http://localhost:3000（ローカル D1 バインディング有効）
```

D1 のテーブルはリクエスト時に自動作成される（`lib/db.ts` の `ensureSchema`）。
明示的にマイグレーションを流す場合:

```bash
npm run db:migrate:local   # ローカル D1
```

## Cloudflare デプロイ

```bash
npm run preview      # Workers ランタイムでローカル確認（opennextjs-cloudflare build && preview）
npm run deploy       # ビルド + Cloudflare Workers へデプロイ
npm run db:migrate   # 本番 D1 マイグレーション
```

初回は D1 データベースを作成し、`wrangler.jsonc` の `database_id` を設定すること。

```bash
npx wrangler d1 create cloverfit-production
```

## デザイン

- **フォント**: Noto Sans JP + Inter（`next/font`）
- **カラー**: 背景 `#050505` / カード `#0f0f0f` / アクセント `#00e05a`（`globals.css` の `@theme`）
- **レスポンシブ**: 640 / 768 / 900 / 960 / 1200px ブレークポイント

## メモ

- 管理者パスワードは平文・トークンは署名なし（旧実装踏襲）。運用強化時はハッシュ化/署名を検討。
- EmailJS の private accessToken は `EMAILJS_ACCESS_TOKEN`（Cloudflare Secret / `.dev.vars`）で上書き可能。

---

© 2026 CloverFit. All rights reserved.
