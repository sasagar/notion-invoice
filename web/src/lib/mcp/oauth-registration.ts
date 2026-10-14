/**
 * MCP クライアントの動的クライアント登録（RFC 7591）の入口処理。
 *
 * 1. 許可制（入口）: 戻り先が許可リスト（client-policy.ts）にない登録は、better-auth に渡す前に
 *    invalid_redirect_uri で拒否する。これは早期にわかりやすく断るための一段目で、最終的な
 *    強制は認可時の validateRedirectUri（auth.ts）が行う（既存クライアントや入口の迂回にも効く）。
 * 2. 互換補正: oauth-provider は application_type 省略時を "web" とみなし、web クライアントには
 *    http の loopback リダイレクトを許さない（OIDC Registration の規定どおり）。一方、MCP SDK を
 *    使うローカルクライアント（Claude Code 等）は application_type を送らずに
 *    http://localhost:<port>/callback で登録するため、そのままでは接続できない。戻り先がすべて
 *    http の loopback なら RFC 8252 のネイティブアプリなので "native" を補う。loopback へ戻る
 *    コードは利用者自身の端末にしか届かないため、攻撃面は広がらない。
 */
import { isAllowedRedirectUri, isHttpLoopback } from "@/lib/mcp/client-policy";

const REGISTER_PATH = "/api/auth/oauth2/register";

function rejectRegistration(description: string): Response {
  return Response.json(
    { error: "invalid_redirect_uri", error_description: description },
    { status: 400, headers: { "Cache-Control": "no-store" } },
  );
}

/**
 * 登録リクエストを検査・補正する。許可しない登録は 400 の Response、それ以外は
 * （必要なら application_type を補った）Request を返す。登録以外はそのまま返す。
 */
export async function gateMcpClientRegistration(req: Request): Promise<Request | Response> {
  if (req.method !== "POST" || new URL(req.url).pathname !== REGISTER_PATH) {
    return req;
  }
  const body: unknown = await req
    .clone()
    .json()
    .catch(() => null);
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    // 形式不正は better-auth 側の検証に任せる（許可制の判定対象になる戻り先が無い）。
    return req;
  }
  const meta = body as Record<string, unknown>;
  const uris = meta["redirect_uris"];
  if (Array.isArray(uris)) {
    const denied = uris.filter((u) => !isAllowedRedirectUri(u));
    if (denied.length > 0) {
      return rejectRegistration(`redirect URI is not allowed on this server: ${denied.join(", ")}`);
    }
  }
  if (
    meta["application_type"] !== undefined ||
    !Array.isArray(uris) ||
    uris.length === 0 ||
    !uris.every(isHttpLoopback)
  ) {
    return req;
  }
  const headers = new Headers(req.headers);
  headers.delete("content-length");
  return new Request(req.url, {
    method: req.method,
    headers,
    body: JSON.stringify({ ...meta, application_type: "native" }),
  });
}
