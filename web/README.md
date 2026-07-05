# notion-invoice-web (移行版)

Next.js からの移行先アプリ。**Waku + Hono + TypeScript**、認証は **better-auth + SQLite**、
PDF は `@react-pdf/renderer` を継続。詳細な移行計画はリポジトリの計画ファイル参照。

移行完了（Phase 6）まではルートの Next.js アプリと**並存**し、パリティ確認後に
このディレクトリをルートへ昇格し Next を撤去する。

## セットアップ

```bash
mise install            # node 固定（mise.toml）
npm install             # 依存（ルートの pnpm ワークスペースと分離するため npm を使用）
```

## コマンド

| 目的         | コマンド                                                   |
| ------------ | ---------------------------------------------------------- |
| 開発サーバ   | `npm run dev`（`waku dev`）                                |
| 本番ビルド   | `npm run build`（`waku build`）                            |
| 本番起動     | `npm run start`（`waku start`、`PORT` で待受ポート指定）   |
| ルート型生成 | `npm run typegen`（`waku router typegen`）                 |
| 整形+lint    | `npm run check`（`vp check`。`vp check --fix` で自動修正） |
| 型チェック   | `npm run typecheck`（`tsc --noEmit`）                      |
| テスト       | `npm run test`（`vp test` / Vitest）                       |

ツールチェーンは **Vite+（`vp`）**（check/test/lint/fmt）、ランタイムは **mise**。
`waku dev/build` は Waku CLI を使う（`vp dev/build` は Waku の3環境ビルドと競合するため使わない）。
