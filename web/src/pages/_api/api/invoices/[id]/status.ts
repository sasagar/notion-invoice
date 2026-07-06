import { guardMutation } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { firstInvoiceIssue, invoiceStatusSchema } from "@/lib/invoice-schema";
import { updateInvoiceStatus } from "@/lib/repository";

// 請求書のステータスだけを即時更新する（詳細画面から編集画面に入らずに変える用）。
export const POST = async (
  req: Request,
  ctx: { params: Record<string, string | string[]> },
): Promise<Response> => {
  const g = await guardMutation(req);
  if (!g.ok) {
    return g.res;
  }
  const id = String(ctx.params.id ?? "");
  const body: unknown = await req.json().catch(() => null);
  const parsed = invoiceStatusSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: firstInvoiceIssue(parsed.error) }, { status: 400 });
  }
  if (!updateInvoiceStatus(db, g.userId, id, parsed.data.status)) {
    return Response.json({ error: "not found" }, { status: 404 });
  }
  return Response.json({ ok: true, status: parsed.data.status });
};
