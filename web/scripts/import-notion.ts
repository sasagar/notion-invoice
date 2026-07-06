/**
 * Notion の全データ（項目マスタ・顧客・自社・請求書・明細行）を SQLite に一括取込する
 * 読み取り専用スクリプト。Notion 側への書き込みは一切行わない（retrieve / query /
 * pages.retrieve と印影の署名付きURLの fetch のみ）。
 *
 * - `--dry-run`: DB へ一切書き込まず、取込対象の件数とパリティ検証結果だけを出力する。
 * - パリティ検証: 各明細行の Notion formula 実値（10%/8%/非課税対象額・小計）と
 *   deriveLineAmounts の計算値、請求書の Notion「請求金額」と computeTotals の invoiceSum を
 *   突合し、不一致を全件ログする。不一致が 1 件でもあれば exit code 2（dry-run でも）。
 *
 * 実行: pnpm run db:import [-- --dry-run]
 */
import process from "node:process";
import { Client } from "@notionhq/client";
import { mapWithConcurrency } from "../src/lib/concurrency";
import { getCredentials } from "../src/lib/credentials";
import { db } from "../src/lib/db";
import { deriveLineAmounts } from "../src/lib/money/line-amounts";
import { computeTotals, type LineAmounts } from "../src/lib/money/sanitizer";
import { getPage, getRows, listInvoices } from "../src/lib/notion/fetchers";
import { mapAccount, mapCustomer, mapInvoiceMeta, mapRow } from "../src/lib/notion/mapper";
import { asNotionPage, numberValue, plainText, relationIds } from "../src/lib/notion/properties";
import { getAccountSealFileId, upsertAccount } from "../src/lib/repository/accounts";
import { upsertCustomer } from "../src/lib/repository/customers";
import { insertFile } from "../src/lib/repository/files";
import { saveInvoice } from "../src/lib/repository/invoices";
import { upsertItem } from "../src/lib/repository/items";

// Notion API の同時リクエスト数上限（平均3req/s のレート制限を一度のバーストで超えない）。
const CONCURRENCY = 3;
// 金額突合の許容誤差（浮動小数の表現差だけを吸収。1 円未満のみ）。
const EPS = 1e-6;

const dryRun = process.argv.includes("--dry-run");

function asRecord(v: unknown): Record<string, unknown> | null {
  return typeof v === "object" && v !== null ? (v as Record<string, unknown>) : null;
}

function near(a: number, b: number): boolean {
  return Math.abs(a - b) <= EPS;
}

/** データソースの relation プロパティから参照先 data_source_id を取り出す。 */
function relationDataSourceId(props: Record<string, unknown>, name: string): string | null {
  const rel = asRecord(asRecord(props[name])?.["relation"]);
  const id = rel?.["data_source_id"] ?? rel?.["database_id"];
  return typeof id === "string" ? id : null;
}

/** 指定 type の最初のプロパティ名を返す（title の発見用）。 */
function findPropByType(props: Record<string, unknown>, type: string): string | null {
  for (const [name, raw] of Object.entries(props)) {
    if (asRecord(raw)?.["type"] === type) {
      return name;
    }
  }
  return null;
}

/** 項目マスタの単価プロパティ名（税抜単価。名称候補→最初の number 型）。 */
function pickUnitPriceName(props: Record<string, unknown>): string | null {
  for (const c of ["単価(税抜)", "単価（税抜）", "単価"]) {
    if (asRecord(props[c])?.["type"] === "number") {
      return c;
    }
  }
  return findPropByType(props, "number");
}

/** データソースの全ページをページネーションで取得する（読み取り専用）。 */
async function queryAllPages(notion: Client, dataSourceId: string): Promise<unknown[]> {
  const results: unknown[] = [];
  let cursor: string | undefined;
  do {
    const res = await notion.dataSources.query({
      data_source_id: dataSourceId,
      ...(cursor ? { start_cursor: cursor } : {}),
    });
    results.push(...res.results);
    cursor = res.has_more && res.next_cursor ? res.next_cursor : undefined;
  } while (cursor);
  return results;
}

// --- 1. 資格情報・クライアント（notion_credentials 先頭ユーザー） ---
const credRow = db.prepare("SELECT user_id FROM notion_credentials LIMIT 1").get() as
  | { user_id: string }
  | undefined;
if (!credRow) {
  console.error("notion_credentials にレコードがありません（資格情報未登録）。");
  process.exit(1);
}
const ownerId = credRow.user_id;
const creds = getCredentials(ownerId);
if (!creds) {
  console.error("資格情報の復号に失敗しました。");
  process.exit(1);
}
const notion = new Client({ auth: creds.apiKey });

console.log(dryRun ? "=== Notion 取込ドライラン ===" : "=== Notion 取込 ===");
console.log(`owner_id: ${ownerId}`);

// --- 2. データソース発見（請求書 → 請求内容(明細行) → 項目(項目マスタ)） ---
const rootDb = asRecord(await notion.databases.retrieve({ database_id: creds.dbId }));
const rootSources = rootDb?.["data_sources"];
const rootFirst = Array.isArray(rootSources) ? asRecord(rootSources[0]) : null;
const invoiceDsId = typeof rootFirst?.["id"] === "string" ? rootFirst["id"] : creds.dbId;

const invoiceDs = asRecord(await notion.dataSources.retrieve({ data_source_id: invoiceDsId }));
const invoiceProps = asRecord(invoiceDs?.["properties"]) ?? {};
const rowsDsId = relationDataSourceId(invoiceProps, "請求内容");
if (!rowsDsId) {
  console.error("請求書DBに relation プロパティ「請求内容」が見つかりません。");
  process.exit(1);
}
const rowsDs = asRecord(await notion.dataSources.retrieve({ data_source_id: rowsDsId }));
const rowsProps = asRecord(rowsDs?.["properties"]) ?? {};
const itemsDsId = relationDataSourceId(rowsProps, "項目");
if (!itemsDsId) {
  console.error("明細行DBに relation プロパティ「項目」が見つかりません。");
  process.exit(1);
}
const itemsDs = asRecord(await notion.dataSources.retrieve({ data_source_id: itemsDsId }));
const itemsProps = asRecord(itemsDs?.["properties"]) ?? {};
const itemTitleName = findPropByType(itemsProps, "title");
const itemUnitPriceName = pickUnitPriceName(itemsProps);
console.log(`項目マスタ: title="${itemTitleName}" 単価="${itemUnitPriceName}" (ds=${itemsDsId})`);

// エラーは中断せず収集し、最後にまとめて報告する。
const errors: string[] = [];

// --- 3. 項目マスタ取込（全ページ）。notion_page_id → 新 id を保持。 ---
const itemPages = await queryAllPages(notion, itemsDsId);
const itemIdMap = new Map<string, string>();
for (const raw of itemPages) {
  const page = asNotionPage(raw);
  const name = itemTitleName ? plainText(page.properties[itemTitleName]) : "";
  const unitPrice = itemUnitPriceName ? numberValue(page.properties[itemUnitPriceName]) : 0;
  if (!dryRun) {
    itemIdMap.set(page.id, upsertItem(db, ownerId, { notionPageId: page.id, name, unitPrice }));
  }
}
const itemCount = itemPages.length;

// --- 4. 請求書 + 明細行を取得（getRows は内部で同時実行制限。多重化しない） ---
const invoicePages = await listInvoices(ownerId);
type Loaded = { raw: (typeof invoicePages)[number]; rawRows: unknown[] };
const loaded: Loaded[] = [];
for (const raw of invoicePages) {
  const meta = mapInvoiceMeta(raw);
  const rawRows = await getRows(ownerId, meta.itemRelationIds);
  loaded.push({ raw, rawRows });
}

// --- 5. 顧客・自社: 請求書から参照される全ページを取得して upsert ---
const customerPageIds = new Set<string>();
const accountPageIds = new Set<string>();
for (const { raw } of loaded) {
  const meta = mapInvoiceMeta(raw);
  if (meta.customerRelationId) {
    customerPageIds.add(meta.customerRelationId);
  }
  if (meta.accountRelationId) {
    accountPageIds.add(meta.accountRelationId);
  }
}

const customerIdMap = new Map<string, string>();
await mapWithConcurrency([...customerPageIds], CONCURRENCY, async (pageId) => {
  const rawCustomer = await getPage(ownerId, pageId).catch(() => null);
  if (!rawCustomer) {
    errors.push(`顧客ページ取得失敗: ${pageId}`);
    return;
  }
  if (!dryRun) {
    const c = mapCustomer(rawCustomer);
    customerIdMap.set(pageId, upsertCustomer(db, ownerId, { notionPageId: pageId, ...c }));
  }
});

const accountIdMap = new Map<string, string>();
let sealDownloaded = 0;
let sealToDownload = 0;
await mapWithConcurrency([...accountPageIds], CONCURRENCY, async (pageId) => {
  const rawAccount = await getPage(ownerId, pageId).catch(() => null);
  if (!rawAccount) {
    errors.push(`自社ページ取得失敗: ${pageId}`);
    return;
  }
  const a = mapAccount(rawAccount);
  if (dryRun) {
    if (a.sealImageUrl) {
      sealToDownload++;
    }
    return;
  }
  // 印影: 既存 seal_file_id があれば再DLしない。無ければ署名付きURLを DL して BLOB 保存。
  let sealFileId = getAccountSealFileId(db, ownerId, pageId);
  if (!sealFileId && a.sealImageUrl) {
    try {
      const res = await fetch(a.sealImageUrl);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const mime = res.headers.get("content-type") ?? "application/octet-stream";
      const buf = Buffer.from(await res.arrayBuffer());
      sealFileId = insertFile(db, ownerId, {
        kind: "seal",
        mimeType: mime,
        byteSize: buf.length,
        data: buf,
      });
      sealDownloaded++;
    } catch (e) {
      errors.push(`印影DL失敗 (${a.companyName || pageId}): ${e instanceof Error ? e.message : e}`);
    }
  }
  accountIdMap.set(
    pageId,
    upsertAccount(db, ownerId, {
      notionPageId: pageId,
      slug: a.slug,
      companyName: a.companyName,
      contactName: a.contactName,
      companyInfo: a.companyInfo,
      bankInfo: a.bankInfo,
      registrationNumber: a.registrationNumber,
      sealFileId,
    }),
  );
});

// --- 6. 請求書ごとに: 明細のパリティ検証 → saveInvoice ---
let rowCount = 0;
let rowMismatch = 0;
let invoiceMismatch = 0;

for (const { raw, rawRows } of loaded) {
  const meta = mapInvoiceMeta(raw);
  const invoiceNumber = meta.id;
  const rowEntries = rawRows
    .map((rawRow) => ({
      row: mapRow(rawRow),
      itemRelIds: relationIds(asNotionPage(rawRow).properties["項目"]),
    }))
    .sort((x, y) => x.row.order - y.row.order);

  const derivedList: LineAmounts[] = [];
  for (const { row } of rowEntries) {
    const derived = deriveLineAmounts(row.unitPrice, row.quantity, row.taxRate);
    derivedList.push(derived);
    rowCount++;
    // Notion formula 実値（row.amounts）と計算値（derived）を 4 フィールドで突合。
    const fields: readonly [string, number, number][] = [
      ["10%対象額", row.amounts.amount10, derived.amount10],
      ["8%対象額", row.amounts.amount8, derived.amount8],
      ["非課税対象額", row.amounts.amount0, derived.amount0],
      ["小計", row.amounts.subtotal, derived.subtotal],
    ];
    for (const [field, notionVal, calcVal] of fields) {
      if (!near(notionVal, calcVal)) {
        rowMismatch++;
        console.error(
          `  [行不一致] ${invoiceNumber} / ${row.name} / ${field}: notion=${notionVal} 計算=${calcVal}`,
        );
      }
    }
  }

  // 請求書レベル: computeTotals.invoiceSum と Notion「請求金額」を突合。
  const totals = computeTotals({
    rows: derivedList,
    taxIncluded: meta.taxIncluded,
    withholdingExempt: meta.withholdingExempt,
  });
  const notionSum = numberValue(raw.properties["請求金額"]);
  if (!near(totals.invoiceSum, notionSum)) {
    invoiceMismatch++;
    console.error(
      `  [請求額不一致] ${invoiceNumber}: notion=${notionSum} 計算=${totals.invoiceSum}`,
    );
  }

  if (!dryRun) {
    saveInvoice(db, ownerId, {
      notionPageId: raw.id,
      invoiceNumber: meta.id,
      title: meta.title,
      status: meta.status,
      customerId: meta.customerRelationId
        ? (customerIdMap.get(meta.customerRelationId) ?? null)
        : null,
      accountId: meta.accountRelationId ? (accountIdMap.get(meta.accountRelationId) ?? null) : null,
      publishedAt: meta.publishedAt,
      dueTo: meta.dueTo,
      taxIncluded: meta.taxIncluded,
      withholdingExempt: meta.withholdingExempt,
      note: meta.note,
      memo: plainText(raw.properties["メモ"]),
      rows: rowEntries.map(({ row, itemRelIds }) => ({
        sortOrder: row.order,
        name: row.name,
        itemNames: row.itemNames,
        unitPrice: row.unitPrice,
        quantity: row.quantity,
        unit: row.unit,
        taxRate: row.taxRate,
        itemIds: itemRelIds
          .map((id) => itemIdMap.get(id))
          .filter((x): x is string => x !== undefined),
      })),
    });
  }
}

// --- 7. 完了レポート ---
console.log(`\n${"=".repeat(70)}`);
console.log(dryRun ? "取込ドライラン結果（DBには書き込んでいません）" : "取込結果");
console.log("=".repeat(70));
console.log(`項目マスタ: ${itemCount} 件`);
console.log(`顧客      : ${customerPageIds.size} 件`);
console.log(`自社      : ${accountPageIds.size} 件`);
console.log(`請求書    : ${loaded.length} 件`);
console.log(`明細行    : ${rowCount} 件`);
console.log(dryRun ? `印影(DL対象): ${sealToDownload} 件` : `印影DL    : ${sealDownloaded} 件`);
console.log(`\nパリティ不一致: 行 ${rowMismatch} 件 / 請求額 ${invoiceMismatch} 件`);
if (errors.length > 0) {
  console.log(`\nエラー (${errors.length} 件):`);
  for (const e of errors) {
    console.log(`  - ${e}`);
  }
}

const totalMismatch = rowMismatch + invoiceMismatch;
if (totalMismatch > 0) {
  console.error(`\nパリティ不一致が ${totalMismatch} 件あります。exit code 2 で終了します。`);
  process.exit(2);
}
console.log("\n完了。");
process.exit(0);
