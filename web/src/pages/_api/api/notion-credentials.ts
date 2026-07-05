import { auth } from "@/lib/auth";
import { upsertCredentials } from "@/lib/credentials";

// 現在のログインユーザーの Notion 資格情報を暗号化保存する。
export const POST = async (req: Request): Promise<Response> => {
  // CSRF 対策: 状態変更なので Origin を必須化し、同一オリジンのみ許可する。
  const origin = req.headers.get("origin");
  if (!origin) {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }
  try {
    if (new URL(origin).host !== req.headers.get("host")) {
      return Response.json({ error: "forbidden" }, { status: 403 });
    }
  } catch {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }

  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "invalid json" }, { status: 400 });
  }

  const { dbId, apiKey } = (body ?? {}) as {
    dbId?: unknown;
    apiKey?: unknown;
  };
  if (
    typeof dbId !== "string" ||
    typeof apiKey !== "string" ||
    dbId.trim() === "" ||
    apiKey.trim() === ""
  ) {
    return Response.json({ error: "データベースIDとAPIキーは必須です" }, { status: 400 });
  }

  upsertCredentials(session.user.id, {
    dbId: dbId.trim(),
    apiKey: apiKey.trim(),
  });
  return Response.json({ ok: true });
};
