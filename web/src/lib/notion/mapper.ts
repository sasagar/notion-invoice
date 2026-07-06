import { computeTotals, type LineAmounts } from "@/lib/money/sanitizer";
import {
  asNotionPage,
  checkbox,
  dateStart,
  firstFileUrl,
  numberValue,
  plainText,
  relationIds,
  rollupTextList,
} from "@/lib/notion/properties";
import type { Account, Customer, Invoice, InvoiceMeta, InvoiceRow } from "@/lib/notion/types";

export function mapInvoiceMeta(raw: unknown): InvoiceMeta {
  const page = asNotionPage(raw);
  const p = page.properties;
  return {
    id: plainText(p["請求書番号"]),
    title: plainText(p["件名"]),
    status: plainText(p["ステータス"]),
    publishedAt: dateStart(p["発行日"]),
    dueTo: dateStart(p["支払い期限日"]),
    taxIncluded: checkbox(p["内税"]),
    withholdingExempt: checkbox(p["源泉徴収非対象"]),
    rounding: "round", // Notion 側には丸め設定が無いため常に四捨五入（従来挙動）
    note: plainText(p["備考"]),
    createdAt: page.created_time,
    updatedAt: page.last_edited_time,
    customerRelationId: relationIds(p["顧客"])[0] ?? null,
    accountRelationId: relationIds(p["担当者"])[0] ?? null,
    itemRelationIds: relationIds(p["請求内容"]),
  };
}

export function mapRow(raw: unknown): InvoiceRow {
  const page = asNotionPage(raw);
  const p = page.properties;
  const amounts: LineAmounts = {
    amount10: numberValue(p["10%対象額"]),
    amount8: numberValue(p["8%対象額"]),
    amount0: numberValue(p["非課税対象額"]),
    subtotal: numberValue(p["小計"]),
  };
  return {
    id: page.id,
    order: numberValue(p["並び順"]),
    name: plainText(p["名前"]),
    itemNames: rollupTextList(p["項目名"]),
    unitPrice: numberValue(p["単価"]),
    quantity: numberValue(p["数量"]),
    unit: plainText(p["単位"]),
    taxRate: plainText(p["税率"]),
    amounts,
  };
}

export function mapCustomer(raw: unknown): Customer {
  const p = asNotionPage(raw).properties;
  return {
    name: plainText(p["顧客名"]),
    companyName: plainText(p["社名/個人名"]),
    honorific: plainText(p["敬称"]),
    companyInfo: plainText(p["会社情報"]),
    contactName: plainText(p["担当者名"]),
  };
}

export function mapAccount(raw: unknown): Account {
  const p = asNotionPage(raw).properties;
  return {
    contactName: plainText(p["担当者名"]),
    companyName: plainText(p["会社名"]),
    sealImageUrl: firstFileUrl(p["印鑑画像"]),
    companyInfo: plainText(p["会社情報"]),
    bankInfo: plainText(p["銀行情報"]),
    registrationNumber: plainText(p["登録番号"]),
    slug: plainText(p["スラッグ"]),
  };
}

/** 請求書ページ + 明細行ページ群から、計算済みドメインモデルを組み立てる。 */
export function buildInvoice(rawInvoice: unknown, rawRows: unknown[]): Invoice {
  const meta = mapInvoiceMeta(rawInvoice);
  const rows = rawRows.map(mapRow).sort((a, b) => a.order - b.order);
  const totals = computeTotals({
    rows: rows.map((r) => r.amounts),
    taxIncluded: meta.taxIncluded,
    withholdingExempt: meta.withholdingExempt,
    rounding: meta.rounding,
  });
  return { meta, rows, totals };
}
