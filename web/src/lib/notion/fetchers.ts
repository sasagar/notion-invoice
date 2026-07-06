import { cached } from "@/lib/cache";
import { getNotionClient } from "@/lib/notion/client";
import { buildInvoice, mapCustomer, mapInvoiceMeta } from "@/lib/notion/mapper";
import { asNotionPage, type NotionPage } from "@/lib/notion/properties";
import type { InvoiceMeta } from "@/lib/notion/types";

// 旧 ISR(30s) 相当。一覧/請求書クエリは 30s、リレーション先ページは 60s。
const LIST_TTL = 30_000;
const PAGE_TTL = 60_000;

/** 全請求書を発行日降順で取得（ページネーション対応・30s キャッシュ）。 */
export async function listInvoices(userId: string): Promise<NotionPage[]> {
  return cached(`list:${userId}`, LIST_TTL, async () => {
    const { notion, dataSourceId } = await getNotionClient(userId);
    const results: unknown[] = [];
    let cursor: string | undefined;
    do {
      const res = await notion.dataSources.query({
        data_source_id: dataSourceId,
        ...(cursor ? { start_cursor: cursor } : {}),
        sorts: [
          { property: "発行日", direction: "descending" },
          { timestamp: "last_edited_time", direction: "descending" },
        ],
      });
      results.push(...res.results);
      cursor = res.has_more && res.next_cursor ? res.next_cursor : undefined;
    } while (cursor);
    return results.map(asNotionPage);
  });
}

/** 請求書番号で 1 件取得（無ければ null）。生ページを返す・30s キャッシュ。 */
export async function getInvoiceByNumber(
  userId: string,
  invoiceNumber: string,
): Promise<unknown | null> {
  return cached(`inv:${userId}:${invoiceNumber}`, LIST_TTL, async () => {
    const { notion, dataSourceId } = await getNotionClient(userId);
    const res = await notion.dataSources.query({
      data_source_id: dataSourceId,
      filter: { property: "請求書番号", rich_text: { equals: invoiceNumber } },
      sorts: [{ timestamp: "last_edited_time", direction: "descending" }],
    });
    return res.results[0] ?? null;
  });
}

/** 任意のページ（顧客/担当者リレーション等）を取得・60s キャッシュ。 */
export async function getPage(userId: string, pageId: string): Promise<unknown> {
  return cached(`page:${userId}:${pageId}`, PAGE_TTL, async () => {
    const { notion } = await getNotionClient(userId);
    return notion.pages.retrieve({ page_id: pageId });
  });
}

/** 明細行（請求内容リレーション）をまとめて取得（各行 60s キャッシュ）。 */
export async function getRows(userId: string, ids: string[]): Promise<unknown[]> {
  return Promise.all(ids.map((id) => getPage(userId, id)));
}

export type InvoiceListItem = {
  meta: InvoiceMeta;
  customerName: string;
  totalAmount: number;
};

/**
 * 表示中のページ分だけ、顧客名+請求額込みで組み立てる（30s キャッシュ）。
 * 明細行の再取得(getRows)が必要になるため、表示ページ単位でキャッシュして
 * 全件分の再計算バーストが起きないようにする（getRows/getPage 自体も60s キャッシュ済み）。
 */
export async function listInvoicesWithTotals(
  userId: string,
  pageNum: number,
  rawPageItems: unknown[],
): Promise<InvoiceListItem[]> {
  return cached(`list-totals:${userId}:${pageNum}`, LIST_TTL, async () => {
    return Promise.all(
      rawPageItems.map(async (rawInvoice) => {
        const meta = mapInvoiceMeta(rawInvoice);
        let customerName = "";
        if (meta.customerRelationId) {
          try {
            const c = mapCustomer(await getPage(userId, meta.customerRelationId));
            customerName = c.companyName || c.name;
          } catch {
            // 顧客名の取得失敗は空のまま続行
          }
        }
        const rawRows = await getRows(userId, meta.itemRelationIds);
        const { totals } = buildInvoice(rawInvoice, rawRows);
        return { meta, customerName, totalAmount: totals.invoiceSum };
      }),
    );
  });
}
