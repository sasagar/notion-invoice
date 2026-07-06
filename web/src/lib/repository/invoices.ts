/**
 * 請求書（invoices / invoice_rows / invoice_row_items 表）の読み書き。
 * 既存ドメイン型 InvoiceMeta / InvoiceRow / Invoice / InvoiceListItem を返し、
 * 金額は行スナップショットから deriveLineAmounts + computeTotals で導出する
 * （Notion 由来の formula 値には依存しない）。
 */
import { randomUUID } from "node:crypto";
import { deriveLineAmounts } from "@/lib/money/line-amounts";
import { computeTotals, type RoundingMode } from "@/lib/money/sanitizer";
import type { InvoiceListItem } from "@/lib/notion/fetchers";
import type { FullInvoice, Invoice, InvoiceMeta, InvoiceRow } from "@/lib/notion/types";
import { getAccount } from "@/lib/repository/accounts";
import { getCustomer } from "@/lib/repository/customers";
import { asRow, boolFromInt, num, str, strOrNull } from "@/lib/repository/row";
import type { AppDatabase } from "@/lib/schema";

/** saveInvoice の明細行入力。sort_order 省略時は配列順を採用。 */
export type InvoiceRowInput = {
  sortOrder?: number;
  name: string;
  itemNames: string[];
  unitPrice: number;
  quantity: number;
  unit: string;
  taxRate: string;
  /** 行の由来となる項目マスタ id 群（invoice_row_items へ記録）。 */
  itemIds?: string[];
};

/** saveInvoice の請求書入力。 */
export type InvoiceInput = {
  notionPageId: string | null;
  invoiceNumber: string;
  title: string;
  status: string;
  customerId: string | null;
  accountId: string | null;
  publishedAt: string | null;
  dueTo: string | null;
  taxIncluded: boolean;
  withholdingExempt: boolean;
  rounding?: RoundingMode; // 行金額の丸め方式（省略時は四捨五入）
  note: string;
  memo: string;
  rows: InvoiceRowInput[];
};

/** エディタ（手動作成/編集）の請求書入力。notion_page_id は扱わない。 */
export type InvoiceEditorInput = Omit<InvoiceInput, "notionPageId">;

/** エディタが復元する明細行（itemIds 込み。表示名/単価は行スナップショット）。 */
export type InvoiceRowData = {
  name: string;
  itemNames: string[];
  unitPrice: number;
  quantity: number;
  unit: string;
  taxRate: string;
  itemIds: string[];
};

/** エディタの初期値（DB id・メモ・行の itemIds を含む完全な編集用データ）。 */
export type InvoiceEditorData = {
  id: string;
  invoiceNumber: string;
  title: string;
  status: string;
  customerId: string | null;
  accountId: string | null;
  publishedAt: string | null;
  dueTo: string | null;
  taxIncluded: boolean;
  withholdingExempt: boolean;
  rounding: RoundingMode;
  note: string;
  memo: string;
  rows: InvoiceRowData[];
};

// getFullInvoiceByNumber の戻り値。Notion 版と共通の型（notion/types.ts）を再エクスポートし、
// `@/lib/repository` からも従来どおり参照できるようにする。
export type { FullInvoice };

// 一覧の並び順は Notion 版（発行日降順→最終更新降順）に合わせる。
// SQLite では NULL が最小のため published_at DESC で未発行が末尾に来る。
const LIST_ORDER = "ORDER BY published_at DESC, updated_at DESC";

/** item_names（JSON 文字列配列）を安全にパースする。 */
function parseItemNames(v: unknown): string[] {
  if (typeof v !== "string") {
    return [];
  }
  try {
    const parsed: unknown = JSON.parse(v);
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function mapInvoiceRow(raw: unknown): InvoiceRow {
  const r = asRow(raw);
  const unitPrice = num(r["unit_price"]);
  const quantity = num(r["quantity"]);
  const taxRate = str(r["tax_rate"]);
  return {
    id: str(r["id"]),
    order: num(r["sort_order"]),
    name: str(r["name"]),
    itemNames: parseItemNames(r["item_names"]),
    unitPrice,
    quantity,
    unit: str(r["unit"]),
    taxRate,
    amounts: deriveLineAmounts(unitPrice, quantity, taxRate),
  };
}

/** DB の rounding 値を RoundingMode に正規化（未知値は従来挙動の四捨五入）。 */
function roundingFrom(v: unknown): RoundingMode {
  return v === "floor" || v === "ceil" ? v : "round";
}

/** InvoiceMeta の id には invoice_number を入れる（既存の意味論に合わせる）。 */
function mapInvoiceMeta(r: Record<string, unknown>, itemRelationIds: string[]): InvoiceMeta {
  return {
    id: str(r["invoice_number"]),
    title: str(r["title"]),
    status: str(r["status"]),
    publishedAt: strOrNull(r["published_at"]),
    dueTo: strOrNull(r["due_to"]),
    taxIncluded: boolFromInt(r["tax_included"]),
    withholdingExempt: boolFromInt(r["withholding_exempt"]),
    rounding: roundingFrom(r["rounding"]),
    note: str(r["note"]),
    createdAt: str(r["created_at"]),
    updatedAt: str(r["updated_at"]),
    customerRelationId: strOrNull(r["customer_id"]),
    accountRelationId: strOrNull(r["account_id"]),
    itemRelationIds,
  };
}

/** 指定請求書の明細行を並び順で取得。 */
function loadRows(db: AppDatabase, invoiceId: string): InvoiceRow[] {
  const rows = db
    .prepare("SELECT * FROM invoice_rows WHERE invoice_id = ? ORDER BY sort_order")
    .all(invoiceId);
  return rows.map(mapInvoiceRow);
}

/** 行スナップショットから請求額の内訳を導出する。 */
function totalsOf(rows: InvoiceRow[], meta: InvoiceMeta): Invoice["totals"] {
  return computeTotals({
    rows: rows.map((x) => x.amounts),
    taxIncluded: meta.taxIncluded,
    withholdingExempt: meta.withholdingExempt,
    rounding: meta.rounding,
  });
}

/**
 * 明細行を全置換で書き込む（saveInvoice / createInvoice / updateInvoiceById 共通）。
 * invoice_row_items は行の ON DELETE CASCADE で消えるため、先に行を全削除する。
 * 呼び出し側のトランザクション内で使う前提。
 */
function writeRows(db: AppDatabase, invoiceId: string, rows: InvoiceRowInput[]): void {
  db.prepare("DELETE FROM invoice_rows WHERE invoice_id = ?").run(invoiceId);
  const insertRow = db.prepare(`
    INSERT INTO invoice_rows
      (id, invoice_id, sort_order, name, item_names, unit_price, quantity, unit, tax_rate)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertRowItem = db.prepare(
    "INSERT OR IGNORE INTO invoice_row_items (row_id, item_id) VALUES (?, ?)",
  );
  rows.forEach((row, index) => {
    const rowId = randomUUID();
    insertRow.run(
      rowId,
      invoiceId,
      row.sortOrder ?? index,
      row.name,
      JSON.stringify(row.itemNames),
      row.unitPrice,
      row.quantity,
      row.unit,
      row.taxRate,
    );
    for (const itemId of row.itemIds ?? []) {
      insertRowItem.run(rowId, itemId);
    }
  });
}

/** オーナーの全請求書メタを発行日降順で取得。 */
export function listInvoiceMetas(db: AppDatabase, ownerId: string): InvoiceMeta[] {
  const invoiceRows = db
    .prepare(`SELECT * FROM invoices WHERE owner_id = ? ${LIST_ORDER}`)
    .all(ownerId);
  return invoiceRows.map((raw) => {
    const r = asRow(raw);
    const rowIds = loadRows(db, str(r["id"])).map((x) => x.id);
    return mapInvoiceMeta(r, rowIds);
  });
}

/**
 * 表示ページ分の請求書を、顧客名+請求額込みで取得する。
 * 合計金額は明細行から導出（deriveLineAmounts + computeTotals の invoiceSum）。
 */
export function listInvoiceItemsPage(
  db: AppDatabase,
  ownerId: string,
  pageNum: number,
  perPage: number,
): { items: InvoiceListItem[]; total: number } {
  const totalRow = db.prepare("SELECT COUNT(*) AS n FROM invoices WHERE owner_id = ?").get(ownerId);
  const total = totalRow === undefined ? 0 : num(asRow(totalRow)["n"]);

  const offset = Math.max(0, (pageNum - 1) * perPage);
  const invoiceRows = db
    .prepare(`SELECT * FROM invoices WHERE owner_id = ? ${LIST_ORDER} LIMIT ? OFFSET ?`)
    .all(ownerId, perPage, offset);

  const items = invoiceRows.map((raw): InvoiceListItem => {
    const r = asRow(raw);
    const rows = loadRows(db, str(r["id"]));
    const meta = mapInvoiceMeta(
      r,
      rows.map((x) => x.id),
    );
    let customerName = "";
    const customerId = strOrNull(r["customer_id"]);
    if (customerId) {
      const c = getCustomer(db, ownerId, customerId);
      if (c) {
        customerName = c.companyName || c.name;
      }
    }
    const totalAmount: number | null = totalsOf(rows, meta).invoiceSum;
    return { meta, customerName, totalAmount };
  });

  return { items, total };
}

/**
 * 請求書番号で完全なデータ（明細・顧客・自社・合計）を取得（無ければ null）。
 * 重複番号は updated_at 最新を採用する（防御的。実際は (owner, number) が一意）。
 */
export function getFullInvoiceByNumber(
  db: AppDatabase,
  ownerId: string,
  invoiceNumber: string,
): FullInvoice | null {
  const raw = db
    .prepare(
      "SELECT * FROM invoices WHERE owner_id = ? AND invoice_number = ? ORDER BY updated_at DESC LIMIT 1",
    )
    .get(ownerId, invoiceNumber);
  if (raw === undefined) {
    return null;
  }
  const r = asRow(raw);
  const rows = loadRows(db, str(r["id"]));
  const meta = mapInvoiceMeta(
    r,
    rows.map((x) => x.id),
  );
  const invoice: Invoice = { meta, rows, totals: totalsOf(rows, meta) };
  const customerId = strOrNull(r["customer_id"]);
  const accountId = strOrNull(r["account_id"]);
  return {
    invoice,
    customer: customerId ? getCustomer(db, ownerId, customerId) : null,
    account: accountId ? getAccount(db, ownerId, accountId) : null,
  };
}

/**
 * 請求書 + 明細を全置換で保存する（1 トランザクション）。生成/更新した id を返す。
 * 既存行は notion_page_id を優先、無ければ (owner, invoice_number) で特定する
 * （冪等 import と番号一意制約の両立。重複番号は最新の保存内容で上書きされる）。
 */
export function saveInvoice(db: AppDatabase, ownerId: string, input: InvoiceInput): string {
  const tx = db.transaction((): string => {
    let existingId: string | null = null;
    if (input.notionPageId) {
      const byNotion = db
        .prepare("SELECT id FROM invoices WHERE owner_id = ? AND notion_page_id = ?")
        .get(ownerId, input.notionPageId);
      if (byNotion !== undefined) {
        existingId = str(asRow(byNotion)["id"]);
      }
    }
    if (existingId === null) {
      const byNumber = db
        .prepare("SELECT id FROM invoices WHERE owner_id = ? AND invoice_number = ?")
        .get(ownerId, input.invoiceNumber);
      if (byNumber !== undefined) {
        existingId = str(asRow(byNumber)["id"]);
      }
    }

    const id = existingId ?? randomUUID();
    if (existingId === null) {
      db.prepare(`
        INSERT INTO invoices
          (id, owner_id, invoice_number, title, status, customer_id, account_id,
           published_at, due_to, tax_included, withholding_exempt, rounding, note, memo, notion_page_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id,
        ownerId,
        input.invoiceNumber,
        input.title,
        input.status,
        input.customerId,
        input.accountId,
        input.publishedAt,
        input.dueTo,
        input.taxIncluded ? 1 : 0,
        input.withholdingExempt ? 1 : 0,
        input.rounding ?? "round",
        input.note,
        input.memo,
        input.notionPageId,
      );
    } else {
      db.prepare(`
        UPDATE invoices SET
          invoice_number = ?, title = ?, status = ?, customer_id = ?, account_id = ?,
          published_at = ?, due_to = ?, tax_included = ?, withholding_exempt = ?,
          rounding = ?, note = ?, memo = ?, notion_page_id = ?, updated_at = datetime('now')
        WHERE id = ?
      `).run(
        input.invoiceNumber,
        input.title,
        input.status,
        input.customerId,
        input.accountId,
        input.publishedAt,
        input.dueTo,
        input.taxIncluded ? 1 : 0,
        input.withholdingExempt ? 1 : 0,
        input.rounding ?? "round",
        input.note,
        input.memo,
        input.notionPageId,
        id,
      );
    }

    writeRows(db, id, input.rows);
    return id;
  });
  return tx();
}

/**
 * 手動作成: 新規請求書を INSERT する（notion_page_id は NULL）。生成した id を返す。
 * (owner, invoice_number) が重複する場合は UNIQUE 制約違反で例外を投げる
 * （呼び出し側は isDuplicateNumberError で 409 に変換する）。
 */
export function createInvoice(db: AppDatabase, ownerId: string, input: InvoiceEditorInput): string {
  const tx = db.transaction((): string => {
    const id = randomUUID();
    db.prepare(`
      INSERT INTO invoices
        (id, owner_id, invoice_number, title, status, customer_id, account_id,
         published_at, due_to, tax_included, withholding_exempt, rounding, note, memo, notion_page_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)
    `).run(
      id,
      ownerId,
      input.invoiceNumber,
      input.title,
      input.status,
      input.customerId,
      input.accountId,
      input.publishedAt,
      input.dueTo,
      input.taxIncluded ? 1 : 0,
      input.withholdingExempt ? 1 : 0,
      input.rounding ?? "round",
      input.note,
      input.memo,
    );
    writeRows(db, id, input.rows);
    return id;
  });
  return tx();
}

/**
 * 手動編集: id 指定で更新（番号変更も可。notion_page_id は変更しない）。
 * 更新できたら true、id が無ければ false。番号が他行と衝突すると UNIQUE 例外を投げる。
 */
export function updateInvoiceById(
  db: AppDatabase,
  ownerId: string,
  id: string,
  input: InvoiceEditorInput,
): boolean {
  const tx = db.transaction((): boolean => {
    const res = db
      .prepare(`
        UPDATE invoices SET
          invoice_number = ?, title = ?, status = ?, customer_id = ?, account_id = ?,
          published_at = ?, due_to = ?, tax_included = ?, withholding_exempt = ?,
          rounding = ?, note = ?, memo = ?, updated_at = datetime('now')
        WHERE owner_id = ? AND id = ?
      `)
      .run(
        input.invoiceNumber,
        input.title,
        input.status,
        input.customerId,
        input.accountId,
        input.publishedAt,
        input.dueTo,
        input.taxIncluded ? 1 : 0,
        input.withholdingExempt ? 1 : 0,
        input.rounding ?? "round",
        input.note,
        input.memo,
        ownerId,
        id,
      );
    if (res.changes === 0) {
      return false;
    }
    writeRows(db, id, input.rows);
    return true;
  });
  return tx();
}

/** 手動削除: id 指定で削除（invoice_rows は ON DELETE CASCADE）。削除できたら true。 */
export function deleteInvoice(db: AppDatabase, ownerId: string, id: string): boolean {
  const res = db.prepare("DELETE FROM invoices WHERE owner_id = ? AND id = ?").run(ownerId, id);
  return res.changes > 0;
}

/** 明細行を itemIds 込みで復元（エディタ初期値用）。 */
function loadEditorRows(db: AppDatabase, invoiceId: string): InvoiceRowData[] {
  const rows = db
    .prepare("SELECT * FROM invoice_rows WHERE invoice_id = ? ORDER BY sort_order")
    .all(invoiceId);
  const itemStmt = db.prepare("SELECT item_id FROM invoice_row_items WHERE row_id = ?");
  return rows.map((raw) => {
    const r = asRow(raw);
    const itemIds = itemStmt.all(str(r["id"])).map((x) => str(asRow(x)["item_id"]));
    return {
      name: str(r["name"]),
      itemNames: parseItemNames(r["item_names"]),
      unitPrice: num(r["unit_price"]),
      quantity: num(r["quantity"]),
      unit: str(r["unit"]),
      taxRate: str(r["tax_rate"]),
      itemIds,
    };
  });
}

function mapEditor(db: AppDatabase, r: Record<string, unknown>): InvoiceEditorData {
  const id = str(r["id"]);
  return {
    id,
    invoiceNumber: str(r["invoice_number"]),
    title: str(r["title"]),
    status: str(r["status"]),
    customerId: strOrNull(r["customer_id"]),
    accountId: strOrNull(r["account_id"]),
    publishedAt: strOrNull(r["published_at"]),
    dueTo: strOrNull(r["due_to"]),
    taxIncluded: boolFromInt(r["tax_included"]),
    withholdingExempt: boolFromInt(r["withholding_exempt"]),
    rounding: roundingFrom(r["rounding"]),
    note: str(r["note"]),
    memo: str(r["memo"]),
    rows: loadEditorRows(db, id),
  };
}

/** id 指定でエディタ初期値を取得（無ければ null）。 */
export function getInvoiceEditorById(
  db: AppDatabase,
  ownerId: string,
  id: string,
): InvoiceEditorData | null {
  const raw = db.prepare("SELECT * FROM invoices WHERE owner_id = ? AND id = ?").get(ownerId, id);
  return raw === undefined ? null : mapEditor(db, asRow(raw));
}

/** 請求書番号でエディタ初期値を取得（編集ページ用・無ければ null）。 */
export function getInvoiceEditorByNumber(
  db: AppDatabase,
  ownerId: string,
  invoiceNumber: string,
): InvoiceEditorData | null {
  const raw = db
    .prepare(
      "SELECT * FROM invoices WHERE owner_id = ? AND invoice_number = ? ORDER BY updated_at DESC LIMIT 1",
    )
    .get(ownerId, invoiceNumber);
  return raw === undefined ? null : mapEditor(db, asRow(raw));
}

/** better-sqlite3 の (owner, invoice_number) UNIQUE 違反かどうか（番号重複の 409 判定用）。 */
export function isDuplicateNumberError(e: unknown): boolean {
  return (
    typeof e === "object" &&
    e !== null &&
    "code" in e &&
    (e as { code?: unknown }).code === "SQLITE_CONSTRAINT_UNIQUE"
  );
}

/** (owner, invoice_number) が既に存在するか（複製時の空き番号探索用）。 */
export function invoiceNumberExists(
  db: AppDatabase,
  ownerId: string,
  invoiceNumber: string,
): boolean {
  const row = db
    .prepare("SELECT 1 FROM invoices WHERE owner_id = ? AND invoice_number = ?")
    .get(ownerId, invoiceNumber);
  return row !== undefined;
}

/**
 * 複製時の空き番号を返す。「元番号-copy」から始め、既存なら -copy2, -copy3 … と
 * 空きが見つかるまで番号を進める（同じ元の再複製でも UNIQUE 衝突しない）。
 */
export function nextCopyNumber(db: AppDatabase, ownerId: string, base: string): string {
  let candidate = `${base}-copy`;
  let n = 2;
  while (invoiceNumberExists(db, ownerId, candidate)) {
    candidate = `${base}-copy${n}`;
    n += 1;
  }
  return candidate;
}
