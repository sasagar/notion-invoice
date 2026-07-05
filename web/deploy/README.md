# デプロイ手順（Proxmox 上の Node サーバー）

移行後アプリ（`web/`）を Proxmox の VM/LXC で `waku start`（ポート 3080）として常駐させる。
ランタイムは **mise**、パッケージ/ツールは **vp（Vite+）**。

## 1. 前提

- mise（node をピン留め: `web/mise.toml`）
- リバースプロキシ（nginx 等）で TLS 終端し、`http://127.0.0.1:3080` へプロキシ
  - **`proxy_set_header Host $host;` を必ず設定**（Cookie の Secure/host 判定と保存APIの Origin 検査のため）

## 2. 環境変数（`/etc/notion-invoice.env`, 600, 非コミット）

| 変数                      | 例 / 必須                                                                 |
| ------------------------- | ------------------------------------------------------------------------- |
| `NODE_ENV`                | `production`（systemd 側で指定済）                                        |
| `BETTER_AUTH_SECRET`      | **必須・32文字以上**（`openssl rand -base64 32`）                         |
| `BETTER_AUTH_URL`         | `https://invoice.bktsk.com`                                               |
| `DATABASE_PATH`           | **必須・絶対パス** 例 `/var/lib/notion-invoice/app.sqlite`                |
| `CRYPTO_KEY`              | **必須・32文字以上**（Notion資格情報の暗号鍵。`openssl rand -base64 32`） |
| `TURNSTILE_SECRET_KEY`    | Turnstile 有効化時（未設定なら captcha 無効）                             |
| `VITE_TURNSTILE_SITE_KEY` | Turnstile のサイトキー。**ビルド時に必要**（クライアントへ埋め込み）      |
| `PER_PAGE`                | 一覧のページ件数（既定 20）                                               |

> `VITE_` 変数はビルド時にバンドルへ埋め込まれる。**`waku build` の前に**設定すること。

## 3. デプロイ

```bash
cd /opt/notion-invoice
git pull origin master
cd web
mise install                 # node をピン留めに合わせる
npm ci                       # 依存（vp/pnpm 運用に切替可）
set -a; . /etc/notion-invoice.env; set +a   # ビルドに VITE_ 変数を渡す
npm run build                # waku build（本番は NODE_ENV=production）
npm run db:migrate           # better-auth テーブル + notion_credentials を作成/更新
# 初回のみ: SEED_ADMIN_EMAIL/PASSWORD を環境に入れて管理者作成
#   SEED_ADMIN_EMAIL=you@example.com SEED_ADMIN_PASSWORD=... npm run db:seed
sudo systemctl restart notion-invoice
```

## 4. SQLite の永続化・バックアップ

- `DATABASE_PATH` は永続ボリューム上の絶対パスに置く（`app.sqlite` 喪失＝ユーザー/資格情報喪失）。
- WAL モードのため `app.sqlite-wal` / `-shm` も同ディレクトリに生成される。
- バックアップ例（cron, WAL を反映した一貫スナップショット）:
  ```bash
  sqlite3 /var/lib/notion-invoice/app.sqlite ".backup '/var/backups/notion-invoice/app-$(date +\%F).sqlite'"
  ```

## 5. ユーザー発行（招待/管理者のみ・自己サインアップ無効）

- 初期管理者は `db:seed` で作成。
- 追加ユーザーは、管理者でログイン中に better-auth の admin API（`/api/auth/admin/create-user`）で発行する。
