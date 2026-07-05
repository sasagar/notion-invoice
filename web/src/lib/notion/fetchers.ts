import { getNotionClient } from "@/lib/notion/client";
import { asNotionPage, type NotionPage } from "@/lib/notion/properties";

/** 全請求書を発行日降順で取得（ページネーション対応）。 */
export async function listInvoices(userId: string): Promise<NotionPage[]> {
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
}

/** 請求書番号で 1 件取得（無ければ null）。生ページを返す。 */
export async function getInvoiceByNumber(
  userId: string,
  invoiceNumber: string,
): Promise<unknown | null> {
  const { notion, dataSourceId } = await getNotionClient(userId);
  const res = await notion.dataSources.query({
    data_source_id: dataSourceId,
    filter: { property: "請求書番号", rich_text: { equals: invoiceNumber } },
    sorts: [{ timestamp: "last_edited_time", direction: "descending" }],
  });
  return res.results[0] ?? null;
}

/** 任意のページ（顧客/担当者リレーション等）を取得。 */
export async function getPage(userId: string, pageId: string): Promise<unknown> {
  const { notion } = await getNotionClient(userId);
  return notion.pages.retrieve({ page_id: pageId });
}

/** 明細行（請求内容リレーション）をまとめて取得。 */
export async function getRows(userId: string, ids: string[]): Promise<unknown[]> {
  const { notion } = await getNotionClient(userId);
  return Promise.all(ids.map((id) => notion.pages.retrieve({ page_id: id })));
}
