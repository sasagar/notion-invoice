import { guardMutation } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { accountSchema, firstIssue } from "@/lib/master-schemas";
import { createAccount, getFileForOwner } from "@/lib/repository";

// 自社マスタを作成する。sealFileId は所有権を検証する。
export const POST = async (req: Request): Promise<Response> => {
  const g = await guardMutation(req);
  if (!g.ok) {
    return g.res;
  }
  const body: unknown = await req.json().catch(() => null);
  const parsed = accountSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: firstIssue(parsed.error) }, { status: 400 });
  }
  if (parsed.data.sealFileId && !getFileForOwner(db, g.userId, parsed.data.sealFileId)) {
    return Response.json({ error: "印影ファイルが見つかりません" }, { status: 400 });
  }
  const id = createAccount(db, g.userId, parsed.data);
  return Response.json({ id });
};
