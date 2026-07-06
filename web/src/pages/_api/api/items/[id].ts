import { guardMutation } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { firstIssue, itemSchema } from "@/lib/master-schemas";
import { deleteItem, updateItem } from "@/lib/repository";

// 項目マスタを更新する。
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
  const parsed = itemSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: firstIssue(parsed.error) }, { status: 400 });
  }
  if (!updateItem(db, g.userId, id, parsed.data)) {
    return Response.json({ error: "not found" }, { status: 404 });
  }
  return Response.json({ ok: true });
};

// 項目マスタを削除する（invoice_row_items は CASCADE。行スナップショットは不変）。
export const DELETE = async (
  req: Request,
  ctx: { params: Record<string, string | string[]> },
): Promise<Response> => {
  const g = await guardMutation(req);
  if (!g.ok) {
    return g.res;
  }
  const id = String(ctx.params.id ?? "");
  if (!deleteItem(db, g.userId, id)) {
    return Response.json({ error: "not found" }, { status: 404 });
  }
  return Response.json({ ok: true });
};
