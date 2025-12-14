# Suggested Commands

## Development

```bash
pnpm dev          # 開発サーバー起動（Turbo使用、ポート3000）
pnpm build        # プロダクションビルド
pnpm start        # プロダクションサーバー起動（ポート3080）
```

## Code Quality

```bash
pnpm lint         # ESLint実行
```

## Package Management

```bash
pnpm install      # 依存関係インストール
pnpm add <pkg>    # パッケージ追加
pnpm remove <pkg> # パッケージ削除
```

## Git Commands (Darwin/macOS)

```bash
git status        # 変更状況確認
git add .         # 全変更をステージング
git commit -m ""  # コミット
git push          # プッシュ
git pull          # プル
git log --oneline # コミット履歴確認
```

## System Utilities (Darwin/macOS)

```bash
ls -la            # ファイル一覧（詳細）
cd <dir>          # ディレクトリ移動
grep -r "pattern" # パターン検索（再帰）
find . -name ""   # ファイル検索
cat <file>        # ファイル内容表示
```

## Supabase CLI

```bash
npx supabase login       # Supabaseログイン
npx supabase start       # ローカルSupabase起動
npx supabase db push     # マイグレーション適用
```
