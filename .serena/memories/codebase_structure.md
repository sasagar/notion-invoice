# Codebase Structure

```
notion-invoice/
├── app/
│   ├── (screen)/              # メイン認証済みルート
│   │   ├── _components/       # 共有コンポーネント
│   │   ├── _utils/            # ユーティリティ
│   │   │   ├── crypto/        # AES-256-CFB暗号化
│   │   │   ├── notion/        # Notion API統合
│   │   │   │   ├── invoiceSanitizer.js  # 税計算ロジック
│   │   │   │   ├── getInvoices.js       # 請求書一覧取得
│   │   │   │   ├── getInvoiceItem.js    # 請求書詳細取得
│   │   │   │   └── ...
│   │   │   ├── supabase/      # Supabaseクライアント
│   │   │   └── properties/    # Notionプロパティ抽出
│   │   ├── auth/              # 認証ページ
│   │   ├── invoice/           # 請求書ルート
│   │   │   ├── (list)/        # 請求書一覧
│   │   │   ├── (item)/        # 請求書詳細
│   │   │   │   ├── @invoiceHeader/
│   │   │   │   ├── @invoiceDetail/
│   │   │   │   └── @invoiceInfo/
│   │   │   ├── @sidebar/      # サイドバー（Parallel Route）
│   │   │   └── _components/   # 請求書用コンポーネント
│   │   ├── user/              # ユーザー設定
│   │   │   ├── @notion/       # Notion設定
│   │   │   └── @profile/      # プロフィール設定
│   │   ├── layout.js          # スクリーンレイアウト
│   │   └── style.css
│   │
│   ├── (print)/               # PDF生成用印刷ルート
│   │   └── print/
│   │       ├── invoice/       # 請求書印刷
│   │       └── estimate/      # 見積書印刷
│   │
│   ├── (callback)/            # OAuth コールバック
│   │
│   ├── api/
│   │   └── print/             # Puppeteer PDF生成API
│   │
│   ├── globals.css            # グローバルスタイル
│   ├── layout.js              # ルートレイアウト
│   └── page.js                # ホームページ
│
├── public/                    # 静的ファイル
├── supabase/                  # Supabase設定
│
├── package.json
├── next.config.js
├── biome.json                 # Biome設定
├── eslint.config.mjs          # ESLint設定
├── postcss.config.js          # PostCSS設定
└── CLAUDE.md                  # プロジェクトガイドライン
```

## Key Files

- `app/(screen)/_utils/notion/invoiceSanitizer.js` - 税計算・源泉徴収のコアロジック
- `app/(screen)/_utils/crypto/` - Notion資格情報の暗号化/復号化
- `app/(screen)/invoice/` - メイン請求書機能
- `app/(print)/` - PDF生成用のシンプルなHTML出力
