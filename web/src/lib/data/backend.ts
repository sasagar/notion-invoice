/**
 * 読み取りバックエンドの切替層（脱 Notion 移行 Phase 1）。
 *
 * 環境変数 `DATA_BACKEND` が `"sqlite"` のときだけ SQLite（lib/repository）を
 * 読み取り元にし、それ以外・未設定なら従来どおり Notion（lib/notion）を使う。
 * notion パスは既存コード（fetchers / build-full-invoice）を「そのまま」呼ぶだけで、
 * キャッシュ・同時実行制限・エラー文言を含め挙動を一切変えない。
 */
import process from "node:process";
import { db } from "@/lib/db";
import { buildFullInvoice } from "@/lib/notion/build-full-invoice";
import {
  getInvoiceByNumber,
  type InvoiceListItem,
  listInvoices,
  listInvoicesWithTotals,
} from "@/lib/notion/fetchers";
import type { FullInvoice } from "@/lib/notion/types";
import { getFullInvoiceByNumber, listInvoiceItemsPage } from "@/lib/repository";

/** 一覧 1 ページ分（表示件数 + 全体件数）。既存の list ページが期待する形。 */
export type InvoiceListPage = { items: InvoiceListItem[]; total: number };

/** DATA_BACKEND=sqlite のときだけ SQLite を読み取り元にする（既定は notion）。 */
export function isSqliteBackend(): boolean {
  return process.env.DATA_BACKEND === "sqlite";
}

// --- notion アダプタ（既存パスをそのまま呼ぶ。1ビットも挙動を変えない） ---

async function notionListInvoicePage(
  userId: string,
  pageNum: number,
  perPage: number,
): Promise<InvoiceListPage> {
  const raw = await listInvoices(userId);
  const total = raw.length;
  const start = (pageNum - 1) * perPage;
  const rawPageItems = raw.slice(start, start + perPage);
  const items = await listInvoicesWithTotals(userId, pageNum, rawPageItems);
  return { items, total };
}

async function notionGetFullInvoice(
  userId: string,
  invoiceNumber: string,
): Promise<FullInvoice | null> {
  const rawInvoice = await getInvoiceByNumber(userId, invoiceNumber);
  if (!rawInvoice) {
    return null;
  }
  return buildFullInvoice(userId, rawInvoice);
}

// --- 公開 API（DATA_BACKEND で分岐） ---

/** 一覧 1 ページ分を取得する。 */
export function listInvoicePage(
  userId: string,
  pageNum: number,
  perPage: number,
): Promise<InvoiceListPage> {
  if (isSqliteBackend()) {
    return Promise.resolve(listInvoiceItemsPage(db, userId, pageNum, perPage));
  }
  return notionListInvoicePage(userId, pageNum, perPage);
}

/** 請求書番号で完全なデータ（明細・顧客・自社）を取得する（無ければ null）。 */
export function getFullInvoice(userId: string, invoiceNumber: string): Promise<FullInvoice | null> {
  if (isSqliteBackend()) {
    return Promise.resolve(getFullInvoiceByNumber(db, userId, invoiceNumber));
  }
  return notionGetFullInvoice(userId, invoiceNumber);
}
