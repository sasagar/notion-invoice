import { guardMutation } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { firstInvoiceIssue, invoiceSchema } from "@/lib/invoice-schema";
import { deleteInvoice, isDuplicateNumberError, updateInvoiceById } from "@/lib/repository";

// 請求書を更新する（id は invoices.id。番号変更可・重複は 409）。
export const PUT = async (
  req: Request,
  ctx: { params: Record<string, string | string[]> },
): Promise<Response> => {
  const g = await guardMutation(req);
  if (!g.ok) {
    return g.res;
  }
  const id = String(ctx.params.id ?? "");
  const body: unknown = await req.json().catch(() => null);
  const parsed = invoiceSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: firstInvoiceIssue(parsed.error) }, { status: 400 });
  }
  try {
    if (!updateInvoiceById(db, g.userId, id, parsed.data)) {
      return Response.json({ error: "not found" }, { status: 404 });
    }
    return Response.json({ ok: true, invoiceNumber: parsed.data.invoiceNumber });
  } catch (e) {
    if (isDuplicateNumberError(e)) {
      return Response.json({ error: "この請求書番号は既に使われています" }, { status: 409 });
    }
    throw e;
  }
};

// 請求書を削除する（invoice_rows は CASCADE）。
export const DELETE = async (
  req: Request,
  ctx: { params: Record<string, string | string[]> },
): Promise<Response> => {
  const g = await guardMutation(req);
  if (!g.ok) {
    return g.res;
  }
  const id = String(ctx.params.id ?? "");
  if (!deleteInvoice(db, g.userId, id)) {
    return Response.json({ error: "not found" }, { status: 404 });
  }
  return Response.json({ ok: true });
};
