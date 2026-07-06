import type { InvoiceTotals, LineAmounts } from "@/lib/money/sanitizer";

export type InvoiceRow = {
  id: string;
  order: number; // 並び順
  name: string; // 名前
  itemNames: string[]; // 項目名（複数可）
  unitPrice: number; // 単価
  quantity: number; // 数量
  unit: string; // 単位
  taxRate: string; // 税率
  amounts: LineAmounts;
};

export type Customer = {
  name: string; // 顧客名
  companyName: string; // 社名/個人名
  honorific: string; // 敬称
  companyInfo: string; // 会社情報
  contactName: string; // 担当者名
};

export type Account = {
  contactName: string; // 担当者名
  companyName: string; // 会社名
  sealImageUrl: string | null; // 印鑑画像
  companyInfo: string; // 会社情報
  bankInfo: string; // 銀行情報
  registrationNumber: string; // 登録番号
  slug: string; // スラッグ
};

export type InvoiceMeta = {
  id: string; // 請求書番号
  title: string; // 件名
  status: string; // ステータス
  publishedAt: string | null; // 発行日
  dueTo: string | null; // 支払い期限日
  taxIncluded: boolean; // 内税
  withholdingExempt: boolean; // 源泉徴収非対象
  note: string; // 備考
  createdAt: string;
  updatedAt: string;
  customerRelationId: string | null; // 顧客
  accountRelationId: string | null; // 担当者
  itemRelationIds: string[]; // 請求内容
};

export type Invoice = {
  meta: InvoiceMeta;
  rows: InvoiceRow[];
  totals: InvoiceTotals;
};

/**
 * 請求書の完全なデータ（明細込みの Invoice + 顧客 + 自社）。
 * Notion 版（build-full-invoice.ts）と SQLite 版（repository/invoices.ts）が
 * 同じ形を返すための共通型。読み取りバックエンド切替（data/backend.ts）の戻り値。
 */
export type FullInvoice = {
  invoice: Invoice;
  customer: Customer | null;
  account: Account | null;
};
