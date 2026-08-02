import { guardMutation } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { duplicateAccount } from "@/lib/repository";

// 自社マスタを複製する（担当者名に -copy を付け、印影は BLOB ごと複製）。
export const POST = async (
  req: Request,
  ctx: { params: Record<string, string | string[]> },
): Promise<Response> => {
  const g = await guardMutation(req);
  if (!g.ok) {
    return g.res;
  }
  const id = String(ctx.params.id ?? "");
  const newId = duplicateAccount(db, g.userId, id);
  if (newId === null) {
    return Response.json({ error: "not found" }, { status: 404 });
  }
  return Response.json({ id: newId });
};
