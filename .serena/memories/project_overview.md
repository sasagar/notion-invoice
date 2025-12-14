# Project Overview: BKTSK Notion Invoice

## Purpose

日本語の請求書管理システム。Next.js (App Router) で構築され、Notionをデータソースとして使用し、Supabaseで認証・資格情報の保存を行う。印刷可能なPDF請求書・見積書を生成する。

## Tech Stack

- **Framework**: Next.js 16 (App Router) with Turbo
- **Language**: JavaScript (ES Modules)
- **Frontend**: React 19.2
- **Styling**: Tailwind CSS v4 (CSS-based configuration)
- **Database/Auth**: Supabase (認証・クレデンシャル保存)
- **Data Source**: Notion API (@notionhq/client)
- **PDF Generation**: Puppeteer
- **CAPTCHA**: Cloudflare Turnstile

## Key Dependencies

- `@notionhq/client` - Notion API
- `@supabase/ssr`, `@supabase/supabase-js` - Supabase
- `crypto-js` - AES-256-CFB暗号化
- `date-fns` - 日付フォーマット
- `puppeteer` - PDF生成
- `react-icons` - アイコン

## Architecture

### Route Groups (App Router)

- `app/(screen)/` - メイン認証済みアプリケーションルート
- `app/(print)/` - PDF生成用印刷専用ルート（invoice/estimate）
- `app/(callback)/` - Supabase OAuth コールバックハンドラ
- `app/api/` - Puppeteer PDF生成用APIルート

### Parallel Routes Pattern

Next.js parallel routes (`@segment`) を多用:

- `invoice/@sidebar` - 動的サイドバーナビゲーション
- `invoice/(item)/@invoiceHeader`, `@invoiceDetail`, `@invoiceInfo` - 請求書詳細セグメント
- `user/@notion`, `@profile` - ユーザー設定セグメント

### Key Utilities (`app/(screen)/_utils/`)

- `crypto/` - Notion資格情報のAES-256-CFB暗号化
- `notion/` - Notion API統合とデータ取得
- `supabase/` - SupabaseクライアントセットアップSSRパターン）
- `properties/` - Notionプロパティ抽出・フォーマッター

### Data Flow

1. Supabase経由でユーザー認証（メール/パスワード + Turnstile CAPTCHA）
2. 暗号化されたNotion資格情報をSupabase `notion`テーブルに保存
3. サーバーサイドで資格情報を復号化してNotion API呼び出し
4. Notionから請求書データを取得し、`invoiceSanitizer()`で処理
5. 印刷ルートが請求書HTMLをレンダリング、Puppeteerが`/api/print/`経由でPDF生成

### Invoice Calculations (`invoiceSanitizer.js`)

- 税モード: 10%、8%、または非課税（行項目ごと）
- 内税・外税両方の税込み計算ロジック
- 源泉徴収税: 非免税請求書に対して10.21%控除
- 計算式: `invoice_sum = sum + tax + withholding`

## Environment Variables

### Required

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase
- `CRYPTO_KEY`, `CRYPTO_IV` - 資格情報暗号化（AES-256-CFB）
- `PUPPETEER_API_KEY` - PDF APIルートセキュリティ
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` - Cloudflare CAPTCHA

### Optional

- `NEXT_PUBLIC_PER_PAGE` - ページネーションサイズ

## Configuration Notes

- Revalidation: 請求書ページに30秒（ISR）
- Remote images: AWS S3とGravatarパターン許可
- Server Actions: localhost:3000とinvoice.bktsk.comから許可
- Production port: 3080
