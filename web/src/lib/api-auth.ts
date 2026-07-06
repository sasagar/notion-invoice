/**
 * 状態変更 API の共通ガード。Origin(CSRF) と session を一箇所で検査し、
 * files / マスタ CRUD の各エンドポイントで再利用する
 * （notion-credentials.ts と同じ流儀を関数に括り出したもの）。
 */
import process from "node:process";
import { auth } from "@/lib/auth";

/**
 * 状態変更リクエストの Origin を検査（CSRF 対策）。
 * 許可 = リクエストの Host、または BETTER_AUTH_URL のホスト
 * （Cloudflare Tunnel 等で Host がどう転送されても弾かないため両方許可）。
 */
export function isAllowedOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) {
    return false;
  }
  const allowedHosts = new Set<string>();
  const reqHost = req.headers.get("host");
  if (reqHost) {
    allowedHosts.add(reqHost);
  }
  try {
    if (process.env.BETTER_AUTH_URL) {
      allowedHosts.add(new URL(process.env.BETTER_AUTH_URL).host);
    }
  } catch {
    // BETTER_AUTH_URL が不正でも Host 側で判定する
  }
  try {
    return allowedHosts.has(new URL(origin).host);
  } catch {
    return false;
  }
}

/** guardMutation の結果。ok=false のときは短絡用の Response を持つ。 */
export type MutationGuard = { ok: true; userId: string } | { ok: false; res: Response };

/**
 * 状態変更 API の共通ガード。Origin(403) → session(401) の順で検査し、
 * 通れば userId を返す。呼び出し側は `if (!g.ok) return g.res;` で短絡する。
 */
export async function guardMutation(req: Request): Promise<MutationGuard> {
  if (!isAllowedOrigin(req)) {
    return { ok: false, res: Response.json({ error: "forbidden" }, { status: 403 }) };
  }
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    return { ok: false, res: Response.json({ error: "unauthorized" }, { status: 401 }) };
  }
  return { ok: true, userId: session.user.id };
}
