# CloverFit for Innovator

## プロジェクト概要

**サービス名**: CloverFit for Innovator  
**コンセプト**: 「ジムで身体は変わった。でも、心は？」  
**ターゲット**: 起業家・経営者（クローズドコミュニティ）  
**技術スタック**: Hono + TypeScript + Cloudflare Pages + D1 Database

---

## 実装済み機能

### ページ構成（8セクション）

| セクション | 内容 |
|-----------|------|
| **Hero** | メインコピー・3ピラー・CTA・実写真BG |
| **Gallery** | トレーニング実写真グリッド（メイン+3枚） |
| **Problem** | 起業家の精神疾患統計（87%/49%/10倍）カード |
| **Solution** | 研究エビデンスバナー + 差別化ポイント4つ |
| **Program** | 60分のセッション構成（4フェーズ） |
| **Origin** | 創業者ストーリー（タイムライン形式）+ 3ピラーカード |
| **Supervisor** | 前野隆司教授の監修情報 |
| **Testimonials** | 体験者の声（3名）|
| **FAQ** | よくある質問（5項目・アコーディオン）|
| **Booking** | 体験申し込みフォーム（バリデーション + DB保存）|

### バックエンド機能

| 機能 | エンドポイント | 説明 |
|------|---------------|------|
| 体験申し込み | POST /api/booking | D1 DBに保存 |
| 管理者ログイン | POST /api/admin/login | JWT風トークン発行 |
| 申し込み一覧 | GET /api/admin/bookings | フィルタ・ページネーション |
| ステータス更新 | PATCH /api/admin/bookings/:id | ステータス・メモ更新 |
| ダッシュボード統計 | GET /api/admin/stats | 集計データ |

### 管理画面

- アクセス: `/admin`
- ログイン情報: `admin` / `cloverfit2026`
- ダッシュボード: 申し込み統計（総数/新規/連絡済み/日程確定/完了）
- 申し込み一覧: フィルタリング・ページネーション・詳細モーダル
- ステータス管理: 新規→連絡済み→日程確定→完了→キャンセル

---

## URL

| 環境 | URL |
|------|-----|
| **サンドボックス** | https://3000-iu3rgx774cfg401kmdy7d-5634da27.sandbox.novita.ai |
| **管理画面** | https://3000-iu3rgx774cfg401kmdy7d-5634da27.sandbox.novita.ai/admin |

---

## データアーキテクチャ

### データモデル

**bookings テーブル**
```sql
id, name, email, phone, position, company, message,
status (new/contacted/scheduled/completed/cancelled),
admin_note, created_at, updated_at
```

**admins テーブル**
```sql
id, username, password_hash, created_at
```

### ストレージ
- **Cloudflare D1**: SQLite データベース（申し込みデータ・管理者）
- **Static Assets**: Cloudflare Pages 静的配信

---

## デプロイ手順

### ローカル開発

```bash
npm run build
pm2 start ecosystem.config.cjs
```

### Cloudflare Pages 本番デプロイ

```bash
# 1. Cloudflare APIキーを設定（Deploy タブから）
# 2. wrangler認証確認
npx wrangler whoami

# 3. D1データベース作成
npx wrangler d1 create cloverfit-production
# → 出力されたdatabase_idをwrangler.jsoncに設定

# 4. ビルド & デプロイ
npm run deploy

# 5. マイグレーション（本番）
npx wrangler d1 migrations apply cloverfit-production
```

---

## デザイン仕様

- **フォント**: Noto Sans JP（300/500/700/900）+ Inter（300/400/600/800）
- **カラーパレット**: 背景 #050505 / カード #0f0f0f / アクセント #00e05a
- **スクロールアニメーション**: IntersectionObserver + opacity/translateY
- **レスポンシブ**: モバイルファースト（768px/860px/900px ブレークポイント）

---

## 未実装・推奨次ステップ

- [ ] Cloudflare Pages 本番デプロイ（Deploy タブでAPIキー設定後）
- [ ] メール通知（Resend/SendGrid API連携）
- [ ] 管理者パスワードのハッシュ化（bcrypt相当）
- [ ] Google Analytics / 計測タグ設定
- [ ] カスタムドメイン設定
- [ ] OGP画像のアップロード

---

© 2026 CloverFit. All rights reserved.
