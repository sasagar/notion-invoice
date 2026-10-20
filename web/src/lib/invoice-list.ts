/**
 * 請求書一覧の絞り込み・集計（画面と MCP で共有する純粋関数）。
 * 金額は一覧項目の totalAmount（御請求額合計）をそのまま足し合わせる。
 */
import { INVOICE_STATUSES } from "@/lib/invoice-schema";
import type { InvoiceListItem } from "@/lib/notion/fetchers";

/** 入金を待っている状態（支払期限の超過判定の対象）。 */
export const AWAITING_PAYMENT_STATUS = "請求書送付済み";

/** 発行済みとして売上に数える状態（ドラフト・見積・キャンセルは除く）。 */
const ISSUED_STATUSES: ReadonlySet<string> = new Set(["請求書送付済み", "支払い済み"]);

// 画面側で { ...filter, status: undefined } のように条件を外せるよう undefined も許す。
export type InvoiceListFilter = {
  status?: string | undefined;
  customerId?: string | undefined;
  /** 件名・請求書番号・顧客名の部分一致（大文字小文字は区別しない）。 */
  q?: string | undefined;
  /** 支払期限を過ぎた入金待ちだけに絞る。 */
  overdue?: boolean | undefined;
};

export type InvoiceListSummary = {
  awaiting: { count: number; amount: number };
  overdue: { count: number; amount: number };
  /** today と同じ年月に発行した請求書（発行済みのみ）。 */
  issuedThisMonth: { count: number; amount: number };
};

/** 入金待ちのまま支払期限（today を含まない）を過ぎているか。today は YYYY-MM-DD。 */
export function isOverdue(item: Pick<InvoiceListItem, "meta">, today: string): boolean {
  const { status, dueTo } = item.meta;
  return status === AWAITING_PAYMENT_STATUS && dueTo !== null && dueTo.slice(0, 10) < today;
}

export function filterInvoiceItems(
  items: InvoiceListItem[],
  filter: InvoiceListFilter,
  today: string,
): InvoiceListItem[] {
  const q = filter.q?.trim().toLowerCase() ?? "";
  return items.filter((item) => {
    const { meta } = item;
    if (filter.status && meta.status !== filter.status) {
      return false;
    }
    if (filter.customerId && meta.customerRelationId !== filter.customerId) {
      return false;
    }
    if (filter.overdue && !isOverdue(item, today)) {
      return false;
    }
    if (q) {
      const haystack = `${meta.id}\n${meta.title}\n${item.customerName}`.toLowerCase();
      if (!haystack.includes(q)) {
        return false;
      }
    }
    return true;
  });
}

export function summarizeInvoiceItems(items: InvoiceListItem[], today: string): InvoiceListSummary {
  const month = today.slice(0, 7);
  const summary: InvoiceListSummary = {
    awaiting: { count: 0, amount: 0 },
    overdue: { count: 0, amount: 0 },
    issuedThisMonth: { count: 0, amount: 0 },
  };
  for (const item of items) {
    const amount = item.totalAmount ?? 0;
    const { status, publishedAt } = item.meta;
    if (status === AWAITING_PAYMENT_STATUS) {
      summary.awaiting.count += 1;
      summary.awaiting.amount += amount;
    }
    if (isOverdue(item, today)) {
      summary.overdue.count += 1;
      summary.overdue.amount += amount;
    }
    if (ISSUED_STATUSES.has(status) && publishedAt?.slice(0, 7) === month) {
      summary.issuedThisMonth.count += 1;
      summary.issuedThisMonth.amount += amount;
    }
  }
  return summary;
}

const STATUS_SET: ReadonlySet<string> = new Set(INVOICE_STATUSES);

/** URL のクエリ文字列から絞り込み条件を読む（未知のステータスは無視）。 */
export function parseListQuery(query: string): InvoiceListFilter {
  const params = new URLSearchParams(query);
  const filter: InvoiceListFilter = {};
  const status = params.get("status");
  if (status && STATUS_SET.has(status)) {
    filter.status = status;
  }
  const customerId = params.get("customer");
  if (customerId) {
    filter.customerId = customerId;
  }
  const q = params.get("q")?.trim();
  if (q) {
    filter.q = q;
  }
  if (params.get("overdue") === "1") {
    filter.overdue = true;
  }
  return filter;
}

/** 絞り込み条件をクエリ文字列にする（先頭の ? 付き。条件なしなら空文字）。 */
export function toListQuery(filter: InvoiceListFilter): string {
  const params = new URLSearchParams();
  if (filter.status) {
    params.set("status", filter.status);
  }
  if (filter.customerId) {
    params.set("customer", filter.customerId);
  }
  if (filter.q) {
    params.set("q", filter.q);
  }
  if (filter.overdue) {
    params.set("overdue", "1");
  }
  const s = params.toString();
  return s ? `?${s}` : "";
}

export function hasListFilter(filter: InvoiceListFilter): boolean {
  return Boolean(filter.status || filter.customerId || filter.q || filter.overdue);
}
