import { guardMutation } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { firstIssue, itemSchema } from "@/lib/master-schemas";
import { createItem } from "@/lib/repository";

// 項目マスタを作成する。
export const POST = async (req: Request): Promise<Response> => {
  const g = await guardMutation(req);
  if (!g.ok) {
    return g.res;
  }
  const body: unknown = await req.json().catch(() => null);
  const parsed = itemSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: firstIssue(parsed.error) }, { status: 400 });
  }
  const id = createItem(db, g.userId, parsed.data);
  return Response.json({ id });
};
