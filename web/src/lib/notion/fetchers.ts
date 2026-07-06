import { cached } from "@/lib/cache";
import { getNotionClient } from "@/lib/notion/client";
import { asNotionPage, type NotionPage } from "@/lib/notion/properties";

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
