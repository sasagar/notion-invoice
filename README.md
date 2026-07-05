# BKTSK Notion Invoice

Notion をデータソースにした請求書・見積書の管理と PDF 出力ツール。

**アプリ本体は [`web/`](./web) にあります。** 旧 Next.js 実装からの移行が完了し、
このカットオーバーで旧実装（`app/` ほか）を撤去しました。

## スタック

- **Waku**（Vite 上の React Server Components）＋ 内部 **Hono** サーバー
- **TypeScript**
- 認証: **better-auth** + **SQLite**（招待/管理者発行、Turnstile 任意）
- Notion 資格情報: ユーザーごとに **AES-256-GCM** で暗号化して SQLite に保存
- PDF: **@react-pdf/renderer**
- スタイル: **Tailwind v4**
- ツールチェーン: **Vite+（`vp`）**、ランタイム: **mise**

## 使い方

- 開発/コマンド: [`web/README.md`](./web/README.md)
- 本番デプロイ（Proxmox / systemd）: [`web/deploy/README.md`](./web/deploy/README.md)

```bash
cd web
npm install
npm run dev        # 開発サーバー（waku dev）
npm run build      # 本番ビルド（waku build）
npm run check      # vp check（整形+lint+型）
npm run test       # vp test（Vitest）
```
