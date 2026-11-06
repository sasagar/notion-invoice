import { z } from "zod";
import { guardMutation } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { setAccountArchived } from "@/lib/repository";

const bodySchema = z.object({ archived: z.boolean() });

// 自社（振込先）のアーカイブ/復元。削除と違い、過去の請求書との紐付けは保たれる。
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
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "archived(boolean) を指定してください" }, { status: 400 });
  }
  const ok = setAccountArchived(db, g.userId, id, parsed.data.archived);
  if (!ok) {
    return Response.json({ error: "not found" }, { status: 404 });
  }
  return Response.json({ ok: true, archived: parsed.data.archived });
};
