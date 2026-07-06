import { guardMutation } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { customerSchema, firstIssue } from "@/lib/master-schemas";
import { deleteCustomer, updateCustomer } from "@/lib/repository";

// 顧客マスタを更新する。
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
  const parsed = customerSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: firstIssue(parsed.error) }, { status: 400 });
  }
  if (!updateCustomer(db, g.userId, id, parsed.data)) {
    return Response.json({ error: "not found" }, { status: 404 });
  }
  return Response.json({ ok: true });
};

// 顧客マスタを削除する（invoices.customer_id は SET NULL）。
export const DELETE = async (
  req: Request,
  ctx: { params: Record<string, string | string[]> },
): Promise<Response> => {
  const g = await guardMutation(req);
  if (!g.ok) {
    return g.res;
  }
  const id = String(ctx.params.id ?? "");
  if (!deleteCustomer(db, g.userId, id)) {
    return Response.json({ error: "not found" }, { status: 404 });
  }
  return Response.json({ ok: true });
};
