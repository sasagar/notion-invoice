# CLAUDE.md

このファイルは Claude Code (claude.ai/code) への本リポジトリでの指針。

## 概要

BKTSK Notion Invoice は、Notion をデータソースにした日本語の請求書・見積書管理
ツール。旧 Next.js 実装から **Waku + Hono + TypeScript** へ移行済み。
**アプリ本体は `web/` サブディレクトリ**にある（このディレクトリで作業する）。

## スタック

- Waku 1.x（Vite 上の RSC）／内部 Hono サーバー、TypeScript strict
- 認証: better-auth + SQLite（better-sqlite3 直）。招待/管理者発行のみ・自己サインアップ無効。Turnstile captcha は任意（`TURNSTILE_SECRET_KEY` 設定時）
- Notion 資格情報: ユーザーごとに AES-256-GCM 暗号化して SQLite に保存（`web/src/lib/crypto`, `web/src/lib/credentials.ts`）
- Notion 取得: `web/src/lib/notion/`（client/fetchers/mapper/properties）。生ページ→ドメインモデル変換で null 非安全アクセスを集約
- 金額計算: `web/src/lib/money/sanitizer.ts`（純粋関数＋Vitest でパリティ固定）
- PDF: `web/src/pdf/`（@react-pdf/renderer）。`_api/api/print/{invoice,estimate}/[slug].ts` で出力
- スタイル: Tailwind v4（`@tailwindcss/vite`）、kent-blue パレット、ライト/ダーク

## コマンド（`web/` 内）

```bash
npm run dev            # waku dev
npm run build          # waku build（dev/build は Waku CLI。vp dev/build は使わない）
npm run start          # waku start（本番。--host/--port で待受指定）
npm run check          # vp check（oxfmt + oxlint + 型）。vp check --fix で自動修正
npm run test           # vp test（Vitest）
npm run db:migrate     # better-auth テーブル + notion_credentials を作成/更新
npm run db:seed        # 初期管理者作成（SEED_ADMIN_EMAIL/PASSWORD）
```

## ルーティング（Waku fs-router, `web/src/pages/`）

- `_layout.tsx`（ヘッダ/フッタ/テーマ）、`index.tsx`（ランディング）、`login.tsx`、`user.tsx`（設定）
- `invoice/list/[page].tsx`（一覧）、`invoice/item/[slug].tsx`（詳細）
- `_api/api/auth/[...all].ts`（better-auth）、`_api/api/print/*`（PDF）、`_api/api/notion-credentials.ts`（資格情報保存）
- 保護ページは `requireSession()`（未ログインは `/login` へ）

## 環境変数（本番）

`BETTER_AUTH_SECRET`(32+), `BETTER_AUTH_URL`, `DATABASE_PATH`(絶対パス), `CRYPTO_KEY`(32+),
`TURNSTILE_SECRET_KEY` / `VITE_TURNSTILE_SITE_KEY`（任意・VITE_ はビルド時必要）, `PER_PAGE`。
詳細は `web/deploy/README.md`。

## 言語

UI・コメントは日本語。日本語フォントは M PLUS 1。日付は date-fns の ja ロケール。
