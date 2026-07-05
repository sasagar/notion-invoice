import { getPage, getRows } from "@/lib/notion/fetchers";
import { buildInvoice, mapAccount, mapCustomer, mapInvoiceMeta } from "@/lib/notion/mapper";
import type { Account, Customer, Invoice } from "@/lib/notion/types";

/** 生の請求書ページから、明細・顧客・自社を含む完全なデータを組み立てる。 */
export async function buildFullInvoice(
  userId: string,
  rawInvoice: unknown,
): Promise<{
  invoice: Invoice;
  customer: Customer | null;
  account: Account | null;
}> {
  const meta = mapInvoiceMeta(rawInvoice);
  const [rawRows, rawCustomer, rawAccount] = await Promise.all([
    getRows(userId, meta.itemRelationIds),
    meta.customerRelationId ? getPage(userId, meta.customerRelationId) : Promise.resolve(null),
    meta.accountRelationId ? getPage(userId, meta.accountRelationId) : Promise.resolve(null),
  ]);
  return {
    invoice: buildInvoice(rawInvoice, rawRows),
    customer: rawCustomer ? mapCustomer(rawCustomer) : null,
    account: rawAccount ? mapAccount(rawAccount) : null,
  };
}
