import { getPage, getRows } from "@/lib/notion/fetchers";
import { buildInvoice, mapAccount, mapCustomer, mapInvoiceMeta } from "@/lib/notion/mapper";
import type { FullInvoice } from "@/lib/notion/types";

export type BuildFullInvoiceOptions = {
  /**
   * true のとき、顧客/自社ページの取得失敗を null として続行する（画面の部分表示用）。
   * 既定 false（PDF 出力用: 不完全な請求書を黙って生成しないため失敗は例外のまま）。
   * 明細行の取得失敗は金額計算が不可能になるため、常に例外。
   */
  lenientRelations?: boolean;
};

/** 生の請求書ページから、明細・顧客・自社を含む完全なデータを組み立てる。 */
export async function buildFullInvoice(
  userId: string,
  rawInvoice: unknown,
  opts?: BuildFullInvoiceOptions,
): Promise<FullInvoice> {
  const meta = mapInvoiceMeta(rawInvoice);
  const lenient = opts?.lenientRelations === true;
  const fetchRelation = (pageId: string | null): Promise<unknown | null> => {
    if (!pageId) {
      return Promise.resolve(null);
    }
    const page = getPage(userId, pageId);
    return lenient ? page.catch(() => null) : page;
  };
  const [rawRows, rawCustomer, rawAccount] = await Promise.all([
    getRows(userId, meta.itemRelationIds),
    fetchRelation(meta.customerRelationId),
    fetchRelation(meta.accountRelationId),
  ]);
  return {
    invoice: buildInvoice(rawInvoice, rawRows),
    customer: rawCustomer ? mapCustomer(rawCustomer) : null,
    account: rawAccount ? mapAccount(rawAccount) : null,
  };
}
