# notion-invoice-web

Notion をデータソースにした請求書・見積書管理アプリ本体。**Waku + Hono + TypeScript**、
認証は **better-auth + SQLite**、PDF は `@react-pdf/renderer`。
旧 Next.js 実装からの移行は完了済み（このディレクトリがアプリ本体）。

## セットアップ

```bash
mise install            # node 24 + pnpm 11.8.0 を導入（mise.toml で固定）
pnpm install            # 依存関係
```

## コマンド

| 目的         | コマンド                                                   |
| ------------ | ---------------------------------------------------------- |
| 開発サーバ   | `pnpm run dev`（`waku dev`）                                |
| 本番ビルド   | `pnpm run build`（`waku build`）                            |
| 本番起動     | `pnpm run start`（`waku start --host 0.0.0.0 --port <PORT>`。PORT 環境変数は無視される） |
| ルート型生成 | `pnpm run typegen`（`waku router typegen`）                 |
| 整形+lint    | `pnpm run check`（`vp check`。`vp check --fix` で自動修正） |
| 型チェック   | `pnpm run typecheck`（`tsc --noEmit`）                      |
| テスト       | `pnpm run test`（`vp test` / Vitest）                       |

ツールチェーンは **Vite+（`vp`）**（check/test/lint/fmt）、ランタイムは **mise**。
`waku dev/build` は Waku CLI を使う（`vp dev/build` は Waku の3環境ビルドと競合するため使わない）。
