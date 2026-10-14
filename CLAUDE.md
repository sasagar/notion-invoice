# CLAUDE.md

このファイルは Claude Code (claude.ai/code) への本リポジトリでの指針。

## 概要

BKTSK Notion Invoice は、日本語の請求書・見積書の管理と PDF 出力ツール。旧 Next.js 実装から
**Waku + Hono + TypeScript** へ移行済み。現在は **脱 Notion 移行中**で、データの読み取り元を
Notion と SQLite で切り替えられる（SQLite モードでは編集・マスタ管理も可能）。
**アプリ本体は `web/` サブディレクトリ**にある（このディレクトリで作業する）。

## スタック

- Waku 1.0.0-beta.x（Vite 上の RSC）／内部 Hono サーバー、TypeScript strict、React Compiler
- 認証: better-auth + SQLite（better-sqlite3 直）。招待/管理者発行のみ・自己サインアップ無効。Turnstile captcha は任意（`TURNSTILE_SECRET_KEY` 設定時）
- Notion 資格情報: ユーザーごとに AES-256-GCM 暗号化して SQLite に保存（`web/src/lib/crypto`, `web/src/lib/credentials.ts`）
- PDF: `web/src/pdf/`（@react-pdf/renderer）。`_api/api/print/{invoice,estimate}/[slug].ts` で出力
- 検証: zod（`invoice-schema.ts` / `master-schemas.ts` はクライアント/サーバ共有）
- スタイル: Tailwind v4（`@tailwindcss/vite`）、kent-blue パレット、ライト/ダーク

## データ層（脱 Notion 移行）

- **切替層** `web/src/lib/data/backend.ts`: `DATA_BACKEND=sqlite` なら `lib/repository`、それ以外は `lib/notion` から読む。notion パスは既存挙動を一切変えない方針
- **Notion** `web/src/lib/notion/`（client/fetchers/mapper/properties/build-full-invoice）。生ページ→ドメインモデル変換で null 非安全アクセスを集約。ドメイン型は `notion/types.ts`（SQLite 側も同じ型を返す）
- **SQLite** `web/src/lib/schema.ts`: `PRAGMA user_version` による migration ladder（DDL を足すたび `APP_SCHEMA_VERSION` を +1 し `if (current < N)` を追加）。表は customers / accounts（自社）/ items / invoices / invoice_rows / invoice_row_items / files（印影 BLOB）。better-auth の表と `notion_credentials` は `db.ts` 管理で schema.ts は触れない
- **repository** `web/src/lib/repository/`: 第 1 引数に `db` を取る関数群（テストでインメモリ DB を渡せる）。明細行は単価・項目名を**スナップショット保存**し、マスタ変更が過去の請求書に波及しない
- **金額計算** `web/src/lib/money/`: `line-amounts.ts`（行の対象額導出）と `sanitizer.ts`（税・源泉徴収・丸め。純粋関数＋Vitest でパリティ固定）。丸めは請求書既定（`invoices.rounding`）を行ごとに上書き可（round/floor/ceil）
- **取込** `scripts/import-notion.ts`（`db:import`）: Notion → SQLite の読み取り専用 upsert（`notion_page_id` キー）。Notion の formula 実値と計算値を突合し、不一致があれば exit 2

## 書き込み API

状態変更エンドポイントは必ず `guardMutation()`（`web/src/lib/api-auth.ts`）を通す:
Origin/CSRF(403) → session(401) → SQLite モード以外は 409。Notion 読み取り中の手編集は
再 import で上書きされるため、UI（`SqliteOnlyNotice`）に加え API でも拒否する。

## MCP サーバー（`/api/mcp`）

AI エージェント向けに請求書データを Streamable HTTP（ステートレス・JSON 応答）で公開する。

- 認証: better-auth の `mcp` プラグイン（OAuth 2.1 + 動的クライアント登録 + PKCE）。
  ディスカバリ `/.well-known/oauth-*` は `web/src/middleware/oauth-well-known.ts` で橋渡しする。
  未ログイン時は `/login?client_id=...` に送られ、`LoginForm` が redirect を追わずにサインインして認可を再開する
- 認可は **同意画面 `/oauth/consent` を必須**にしている（`web/src/lib/mcp/oauth-guards.ts`）。プラグイン既定では
  prompt=consent 無しだと同意なしでコードを返し、登録が誰でもできるためリンク 1 つでトークンを奪えるため。
  同意前コード（consent_code）のトークン交換も拒否する。これらのガードは外さないこと
- ツール定義: `web/src/lib/mcp/server.ts`（リクエストごとに userId を束縛して生成）。
  請求書の読み取り/PDF は両バックエンド対応、マスタ参照と書き込みは SQLite モードのみ。削除系ツールは提供しない
- AI からの既存請求書の変更可否: `web/src/lib/mcp/policy.ts` の `agentWriteDenialReason`
- OAuth 用テーブル（oauthApplication/oauthAccessToken/oauthConsent）は `db:migrate` で作成。本番の `BETTER_AUTH_URL` は公開 URL にする（メタデータの issuer/resource になる）

## コマンド（`web/` 内）

```bash
pnpm run dev            # waku dev（predev で router typegen）
pnpm run build          # waku build（dev/build は Waku CLI。vp dev/build は使わない）
pnpm run start          # waku start（本番。--host/--port で待受指定）
pnpm run check          # vp check（oxfmt + oxlint + 型）。vp check --fix で自動修正
pnpm run test           # vitest run
pnpm run db:migrate     # better-auth テーブル + notion_credentials + アプリスキーマを作成/更新
pnpm run db:seed        # 初期管理者作成（SEED_ADMIN_EMAIL/PASSWORD）
pnpm run db:import      # Notion → SQLite 取込（-- --dry-run で件数とパリティ検証のみ）
pnpm run notion:schema  # Notion DB スキーマのダンプ（設計調査用）
```

## ルーティング（Waku fs-router, `web/src/pages/`）

- `_layout.tsx`（ヘッダ/フッタ/テーマ）、`index.tsx`（ランディング）、`login.tsx`、`user.tsx`（設定）
- 請求書: `invoice/list/[page].tsx`（一覧）、`invoice/item/[slug].tsx`（詳細）、`invoice/item/[slug]/edit.tsx`（編集）、`invoice/new.tsx`（新規）
- マスタ（SQLite 専用）: `masters/index.tsx`、`masters/{customers,accounts,items}.tsx` と各 `[id].tsx`
- API（`_api/api/`）: `auth/[...all].ts`（better-auth）、`print/*`（PDF）、`notion-credentials.ts`、`files.ts`（印影 UP）、
  `invoices`（作成/更新/`duplicate`/`status`）、`customers`（CRUD/`archive`）、`accounts`（CRUD/`duplicate`）、`items`（CRUD）
- 保護ページは `requireSession()`（未ログインは `/login` へ）
- `_api/api/mcp.ts`（MCP エンドポイント）、`oauth/consent.tsx`（MCP 接続の同意画面）
- `pages.gen.ts` は typegen の生成物（手で編集しない）

## ビルド上の注意

`waku.config.ts` で `better-sqlite3`（ネイティブ）と `@react-pdf/renderer` を rsc/ssr 環境から外部化している。
@react-pdf を rsc でバンドルすると react が react-server 条件で解決され PDF 生成が落ちるため、外さないこと。

## 環境変数（本番）

`BETTER_AUTH_SECRET`(32+), `BETTER_AUTH_URL`, `DATABASE_PATH`(絶対パス), `CRYPTO_KEY`(32+),
`DATA_BACKEND`（`notion` 既定／`sqlite`）, `TURNSTILE_SECRET_KEY` / `VITE_TURNSTILE_SITE_KEY`（任意・VITE_ はビルド時必要）, `PER_PAGE`（既定 20）。
詳細は `web/deploy/README.md`。

## 言語

UI・コメントは日本語。日本語フォントは M PLUS 1。日付は Temporal(temporal-polyfill) で扱う。
