import { guardMutation } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { accountSchema, firstIssue } from "@/lib/master-schemas";
import {
  deleteAccount,
  deleteFile,
  getAccountSealFileIdById,
  getFileForOwner,
  updateAccount,
} from "@/lib/repository";

// 自社マスタを更新する。印影が差し替わったら旧BLOBを削除する。
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
  const parsed = accountSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: firstIssue(parsed.error) }, { status: 400 });
  }
  if (parsed.data.sealFileId && !getFileForOwner(db, g.userId, parsed.data.sealFileId)) {
    return Response.json({ error: "印影ファイルが見つかりません" }, { status: 400 });
  }
  const prevSeal = getAccountSealFileIdById(db, g.userId, id);
  if (!updateAccount(db, g.userId, id, parsed.data)) {
    return Response.json({ error: "not found" }, { status: 404 });
  }
  if (prevSeal && prevSeal !== parsed.data.sealFileId) {
    deleteFile(db, g.userId, prevSeal);
  }
  return Response.json({ ok: true });
};

// 自社マスタを削除する（invoices.account_id は SET NULL）。印影BLOBも削除する。
export const DELETE = async (
  req: Request,
  ctx: { params: Record<string, string | string[]> },
): Promise<Response> => {
  const g = await guardMutation(req);
  if (!g.ok) {
    return g.res;
  }
  const id = String(ctx.params.id ?? "");
  const prevSeal = getAccountSealFileIdById(db, g.userId, id);
  if (!deleteAccount(db, g.userId, id)) {
    return Response.json({ error: "not found" }, { status: 404 });
  }
  if (prevSeal) {
    deleteFile(db, g.userId, prevSeal);
  }
  return Response.json({ ok: true });
};
