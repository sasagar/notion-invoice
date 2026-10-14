/**
 * MCP クライアントの動的クライアント登録（RFC 7591）の互換補正。
 *
 * oauth-provider は application_type 省略時を "web" とみなし、web クライアントには
 * http の loopback リダイレクトを許さない（OIDC Registration の規定どおり）。一方、
 * MCP SDK を使うローカルクライアント（Claude Code 等）は application_type を送らずに
 * http://localhost:<port>/callback で登録するため、そのままでは接続できない。
 * 戻り先がすべて http の loopback なら RFC 8252 のネイティブアプリなので "native" を補う。
 * loopback へ戻るコードは利用者自身の端末にしか届かないため、攻撃面は広がらない。
 */

const REGISTER_PATH = "/api/auth/oauth2/register";
const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

function isHttpLoopback(uri: unknown): boolean {
  if (typeof uri !== "string") {
    return false;
  }
  try {
    const url = new URL(uri);
    return url.protocol === "http:" && LOOPBACK_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
}

/** 登録リクエストなら application_type を補った Request を返す（対象外はそのまま）。 */
export async function normalizeMcpClientRegistration(req: Request): Promise<Request> {
  if (req.method !== "POST" || new URL(req.url).pathname !== REGISTER_PATH) {
    return req;
  }
  const body: unknown = await req
    .clone()
    .json()
    .catch(() => null);
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return req;
  }
  const meta = body as Record<string, unknown>;
  const uris = meta["redirect_uris"];
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
