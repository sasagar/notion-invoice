import { guardMutation } from "@/lib/api-auth";
import { db } from "@/lib/db";
import type { InvoiceEditorInput } from "@/lib/repository";
import { createInvoice, getInvoiceEditorById, invoiceNumberExists } from "@/lib/repository";

/** 「元番号-copy」から始めて、空いている複製番号を返す。 */
function freeCopyNumber(ownerId: string, base: string): string {
  let candidate = `${base}-copy`;
  let n = 2;
  while (invoiceNumberExists(db, ownerId, candidate)) {
    candidate = `${base}-copy${n}`;
    n += 1;
  }
  return candidate;
}

// 請求書を複製する（番号=元番号-copy、ステータス=ドラフト、発行日/期限=null）。
export const POST = async (
  req: Request,
  ctx: { params: Record<string, string | string[]> },
): Promise<Response> => {
  const g = await guardMutation(req);
  if (!g.ok) {
    return g.res;
  }
  const id = String(ctx.params.id ?? "");
  const src = getInvoiceEditorById(db, g.userId, id);
  if (!src) {
    return Response.json({ error: "not found" }, { status: 404 });
  }
  const invoiceNumber = freeCopyNumber(g.userId, src.invoiceNumber);
  const input: InvoiceEditorInput = {
    invoiceNumber,
    title: src.title,
    status: "ドラフト",
    customerId: src.customerId,
    accountId: src.accountId,
    publishedAt: null,
    dueTo: null,
    taxIncluded: src.taxIncluded,
    withholdingExempt: src.withholdingExempt,
    note: src.note,
    memo: src.memo,
    rows: src.rows.map((r) => ({
      name: r.name,
      itemNames: r.itemNames,
      unitPrice: r.unitPrice,
      quantity: r.quantity,
      unit: r.unit,
      taxRate: r.taxRate,
      itemIds: r.itemIds,
    })),
  };
  const newId = createInvoice(db, g.userId, input);
  return Response.json({ id: newId, invoiceNumber });
};
