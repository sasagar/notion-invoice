/**
 * 脱 Notion 移行で追加するアプリスキーマの migration ladder。
 * SQLite の `PRAGMA user_version` を段階番号として使い、未適用分の DDL だけを流す。
 * better-auth の `user`/session 等や `notion_credentials`（db.ts 管理）には触れない。
 */
import type Database from "better-sqlite3";

/** better-sqlite3 の Database インスタンス型（このプロジェクト共通の別名）。 */
export type AppDatabase = Database.Database;

/** 現在のアプリスキーマ版数。DDL を足すたびに +1 し、下に `if (current < N)` を追加する。 */
const APP_SCHEMA_VERSION = 2;

// version 0 -> 1: 顧客/自社/項目マスタ・請求書・明細・ファイルの各表を作成。
// FK の親表を先に作る（SQLite の FK は行挿入時に検証されるが、CREATE 順は
// files を accounts より先にするのが安全）。`user` は better-auth 管理の外部表で、
// SQLite は未作成の親表への前方参照 FK を許容するため CREATE 時点では存在不要。
const SCHEMA_V1 = `
  CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    owner_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT '',          -- 顧客名(title)
    company_name TEXT NOT NULL DEFAULT '',  -- 社名/個人名
    honorific TEXT NOT NULL DEFAULT '',     -- 敬称(御中/様)
    company_info TEXT NOT NULL DEFAULT '',  -- 会社情報(複数行)
    contact_name TEXT NOT NULL DEFAULT '',  -- 担当者名
    notion_page_id TEXT UNIQUE,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS files (
    id TEXT PRIMARY KEY,
    owner_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    kind TEXT NOT NULL DEFAULT 'seal',
    mime_type TEXT NOT NULL,
    byte_size INTEGER NOT NULL,
    data BLOB NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY,
    owner_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    slug TEXT NOT NULL DEFAULT '',
    company_name TEXT NOT NULL DEFAULT '',
    contact_name TEXT NOT NULL DEFAULT '',  -- 担当者名(title)
    company_info TEXT NOT NULL DEFAULT '',
    bank_info TEXT NOT NULL DEFAULT '',
    registration_number TEXT NOT NULL DEFAULT '',
    seal_file_id TEXT REFERENCES files(id) ON DELETE SET NULL,
    notion_page_id TEXT UNIQUE,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS items (  -- 項目マスタ(項目名+単価のみの小さな表)
    id TEXT PRIMARY KEY,
    owner_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT '',        -- 項目(title)
    unit_price REAL NOT NULL DEFAULT 0,   -- 単価(税抜)
    notion_page_id TEXT UNIQUE,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY,
    owner_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    invoice_number TEXT NOT NULL,
    title TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'ドラフト',
    customer_id TEXT REFERENCES customers(id) ON DELETE SET NULL,
    account_id TEXT REFERENCES accounts(id) ON DELETE SET NULL,
    published_at TEXT,
    due_to TEXT,
    tax_included INTEGER NOT NULL DEFAULT 0,
    withholding_exempt INTEGER NOT NULL DEFAULT 0,
    note TEXT NOT NULL DEFAULT '',   -- 備考
    memo TEXT NOT NULL DEFAULT '',   -- メモ(Notionの「メモ」プロパティ、社内用)
    notion_page_id TEXT UNIQUE,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE UNIQUE INDEX IF NOT EXISTS idx_invoices_owner_number ON invoices(owner_id, invoice_number);
  CREATE INDEX IF NOT EXISTS idx_invoices_owner_published ON invoices(owner_id, published_at DESC);

  CREATE TABLE IF NOT EXISTS invoice_rows (
    id TEXT PRIMARY KEY,
    invoice_id TEXT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    name TEXT NOT NULL DEFAULT '',           -- 表示名(title)
    item_names TEXT NOT NULL DEFAULT '[]',   -- 項目名スナップショット(JSON文字列配列)
    unit_price REAL NOT NULL DEFAULT 0,      -- 単価スナップショット(マスタ変更が過去に波及しない)
    quantity REAL NOT NULL DEFAULT 0,
    unit TEXT NOT NULL DEFAULT '',           -- 時間/件/式/回/日/人
    tax_rate TEXT NOT NULL DEFAULT '10%'     -- '10%'|'8%'|'非課税'
  );

  CREATE INDEX IF NOT EXISTS idx_invoice_rows_invoice ON invoice_rows(invoice_id, sort_order);

  CREATE TABLE IF NOT EXISTS invoice_row_items (  -- 行→項目マスタの参照(由来トレース用)
    row_id TEXT NOT NULL REFERENCES invoice_rows(id) ON DELETE CASCADE,
    item_id TEXT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    PRIMARY KEY (row_id, item_id)
  );
`;

// version 1 -> 2: 行金額の丸め方式を請求書ごとに選べるようにする
// （'round'=四捨五入(既定・従来挙動) / 'floor'=切り捨て / 'ceil'=切り上げ）。
const SCHEMA_V2 = `
  ALTER TABLE invoices ADD COLUMN rounding TEXT NOT NULL DEFAULT 'round';
`;

/**
 * 未適用のアプリスキーマ DDL を順に流し、`user_version` を最新へ進める。
 * 既に最新なら何もしない（起動ごと・スクリプトからの多重呼び出しに対して冪等）。
 */
export function applyAppSchema(db: AppDatabase): void {
  const raw = db.pragma("user_version", { simple: true });
  const current = typeof raw === "number" ? raw : 0;
  if (current >= APP_SCHEMA_VERSION) {
    return;
  }
  const upgrade = db.transaction(() => {
    if (current < 1) {
      db.exec(SCHEMA_V1);
    }
    if (current < 2) {
      db.exec(SCHEMA_V2);
    }
    db.pragma(`user_version = ${APP_SCHEMA_VERSION}`);
  });
  upgrade();
}
