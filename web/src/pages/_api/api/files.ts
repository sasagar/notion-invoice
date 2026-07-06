import { guardMutation } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { insertFile } from "@/lib/repository";
import { validateSealFile } from "@/lib/seal-upload";

// 印影画像をアップロードして files 表へ BLOB 保存し、{ id } を返す。
// multipart/form-data の "file" フィールドを受け取る。配信は data URI で完結するため
// GET ルートは設けない。
export const POST = async (req: Request): Promise<Response> => {
  const g = await guardMutation(req);
  if (!g.ok) {
    return g.res;
  }
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return Response.json({ error: "invalid form data" }, { status: 400 });
  }
  const file = form.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "ファイルが必要です" }, { status: 400 });
  }
  const v = validateSealFile(file.type, file.size);
  if (!v.ok) {
    return Response.json({ error: v.error }, { status: 400 });
  }
  const buf = Buffer.from(await file.arrayBuffer());
  const id = insertFile(db, g.userId, {
    kind: "seal",
    mimeType: file.type,
    byteSize: buf.length,
    data: buf,
  });
  return Response.json({ id });
};
