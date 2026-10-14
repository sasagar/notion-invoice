/**
 * better-auth mcp プラグイン（OAuth 2.1 認可サーバー）の前段に置くガード。
 * プラグインの既定挙動のうち、動的クライアント登録が誰でも可能な前提では危険な 2 点を塞ぐ。
 */
import type { AppDatabase } from "@/lib/schema";

const AUTHORIZE_PATH = "/api/auth/mcp/authorize";
const TOKEN_PATH = "/api/auth/mcp/token";

/**
 * 認可リクエストに prompt=consent を強制する。
 * プラグインは prompt=consent が無いと同意なしで即座に認可コードを redirect_uri へ返すため、
 * 攻撃者が自分の redirect_uri で作ったリンクをログイン中の利用者に踏ませるだけで
 * トークンを奪えてしまう。クライアント指定の prompt は信用せず、常に同意画面を経由させる。
 */
export function forceConsent(req: Request): Request {
  const url = new URL(req.url);
  if (url.pathname !== AUTHORIZE_PATH || url.searchParams.get("prompt") === "consent") {
    return req;
  }
  url.searchParams.set("prompt", "consent");
  return new Request(url, req);
}

/** トークンリクエストのボディ（form / JSON）から authorization_code の code を取り出す。 */
async function authorizationCodeOf(req: Request): Promise<string | null> {
  const type = req.headers.get("content-type") ?? "";
  let grantType: unknown;
  let code: unknown;
  if (type.includes("application/json")) {
    const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
    grantType = body?.["grant_type"];
    code = body?.["code"];
  } else {
    const form = new URLSearchParams(await req.text().catch(() => ""));
    grantType = form.get("grant_type");
    code = form.get("code");
  }
  return grantType === "authorization_code" && typeof code === "string" ? code : null;
}

/**
 * 同意前のコード（consent_code）でのトークン交換を拒否する（拒否時は 400 の Response）。
 * プラグインのトークンエンドポイントは requireConsent を確認しないため、同意画面の URL に
 * 載る consent_code が漏れると同意なしでトークン化できてしまう。多層防御としてここで弾く。
 */
export async function rejectUnconsentedCode(
  db: AppDatabase,
  req: Request,
): Promise<Response | null> {
  if (req.method !== "POST" || new URL(req.url).pathname !== TOKEN_PATH) {
    return null;
  }
  const code = await authorizationCodeOf(req.clone());
  if (code === null) {
    return null;
  }
  const row = db.prepare("SELECT value FROM verification WHERE identifier = ?").get(code) as
    | { value: string }
    | undefined;
  let requireConsent = false;
  try {
    requireConsent = row !== undefined && JSON.parse(row.value)?.requireConsent === true;
  } catch {
    requireConsent = false;
  }
  if (!requireConsent) {
    return null;
  }
  return Response.json(
    { error: "invalid_grant", error_description: "authorization not consented" },
    { status: 400, headers: { "Cache-Control": "no-store" } },
  );
}
