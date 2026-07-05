import "@/lib/env";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import Database from "better-sqlite3";

const dbPath = process.env.DATABASE_PATH ?? "data/app.sqlite";
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
// better-auth の user テーブルとは別に、アプリ側で作成・管理する。
db.exec(`
  CREATE TABLE IF NOT EXISTS notion_credentials (
    user_id     TEXT PRIMARY KEY,
    db_id_enc   TEXT NOT NULL,
    api_key_enc TEXT NOT NULL,
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);
