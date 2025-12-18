# PDF生成を @react-pdf/renderer へ移行する計画

## 概要
Puppeteerベースの冗長なPDF生成を、@react-pdf/rendererによる直接生成に移行する。

## 現状の課題
- 毎回Chromiumブラウザを起動・終了（重い）
- localhost経由で自分自身にHTTPリクエスト
- `(print)` ルートグループが冗長

## 移行後のアーキテクチャ
```
クライアント → API Route → @react-pdf/renderer → PDFバイナリ直接返却
```

**削除されるもの:**
- `app/(print)/` ルートグループ全体
- `app/api/_utils/pdfGenerator.js` (Puppeteer)
- Puppeteer依存関係

---

## 実装計画

### Phase 1: 準備
1. 新しいブランチを作成: `feature/react-pdf-migration`
2. @react-pdf/rendererをインストール

### Phase 2: PDFテンプレート作成
1. 共有スタイル定義を作成
   - `app/_shared/pdf/styles.js`
2. 請求書PDFコンポーネント作成
   - `app/_shared/pdf/InvoiceDocument.js`
3. 見積書PDFコンポーネント作成
   - `app/_shared/pdf/EstimateDocument.js`

### Phase 3: API Route更新
1. `/api/print/invoice/[slug]/route.js` を更新
   - Puppeteer呼び出し → renderToBuffer()
2. `/api/print/estimate/[slug]/route.js` を更新

### Phase 4: クリーンアップ
1. `app/(print)/` ディレクトリ削除
2. `app/api/_utils/pdfGenerator.js` 削除
3. Puppeteer依存関係削除
4. `proxy.js` から Puppeteer認証ロジック削除

### Phase 5: テスト・検証
1. 請求書PDFの生成テスト
2. 見積書PDFの生成テスト
3. レイアウト・スタイルの確認
4. 日本語フォントの表示確認

---

## 修正対象ファイル

### 新規作成
- `app/_shared/pdf/styles.js`
- `app/_shared/pdf/InvoiceDocument.js`
- `app/_shared/pdf/EstimateDocument.js`

### 更新
- `app/api/print/invoice/[slug]/route.js`
- `app/api/print/estimate/[slug]/route.js`
- `package.json` (依存関係)
- `proxy.js` (Puppeteer認証削除)

### 削除
- `app/(print)/` ディレクトリ全体
- `app/api/_utils/pdfGenerator.js`

---

## 注意点
- @react-pdf/rendererは独自のスタイル記法（Tailwind CSS不可）
- 日本語フォントの登録が必要（M PLUS 1など）
- 現在のHTMLテンプレートのレイアウトを再現する必要あり
