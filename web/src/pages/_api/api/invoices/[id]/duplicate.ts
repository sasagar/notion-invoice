import { guardMutation } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { duplicateInvoice } from "@/lib/repository";

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
  const copied = duplicateInvoice(db, g.userId, id);
  if (!copied) {
    return Response.json({ error: "not found" }, { status: 404 });
  }
  return Response.json(copied);
};
