import "@/lib/env";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";
import { applyAppSchema } from "@/lib/schema";

const isProduction = process.env.NODE_ENV === "production";
const rawPath = process.env.DATABASE_PATH;

// 本番は cwd 非依存の絶対パスを必須にする（起動場所違いで別DBを作り
// データが消えたように見える事故を防ぐ）。
if (isProduction && (!rawPath || !path.isAbsolute(rawPath))) {
  throw new Error("DATABASE_PATH must be set to an absolute path in production");
}

// 開発デフォルトは cwd ではなく web ルート基準で解決（src/lib/db.ts -> web/）。
const webRoot = fileURLToPath(new URL("../..", import.meta.url));
const dbPath = rawPath ?? path.join(webRoot, "data/app.sqlite");
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

export const db = new Database(dbPath);

// 資格情報・セッションを含むDBファイルの権限をオーナーのみに制限。
try {
  fs.chmodSync(dbPath, 0o600);
} catch {
  // chmod 非対応環境は無視
}

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// Notion 資格情報（ユーザーごと、暗号化して保存）。
// user 削除時に孤児化しないよう FK(ON DELETE CASCADE)を張る。
db.exec(`
  CREATE TABLE IF NOT EXISTS notion_credentials (
    user_id     TEXT PRIMARY KEY REFERENCES user(id) ON DELETE CASCADE,
    db_id_enc   TEXT NOT NULL,
    api_key_enc TEXT NOT NULL,
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

// 脱 Notion 移行で追加するアプリスキーマ（顧客/請求書/明細/ファイル等）を適用。
// notion_credentials 作成の後・アプリ利用より前に、user_version ベースで冪等に流す。
applyAppSchema(db);
