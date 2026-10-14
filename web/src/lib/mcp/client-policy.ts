/**
 * MCP の OAuth で受け入れる接続元（クライアント）の許可リスト。
 *
 * DCR も CIMD も「誰でもクライアントを作れる」仕組みのため、攻撃者が自分の戻り先を持つ
 * クライアントを作り、同意画面で利用者を騙して許可させればデータを読まれ得る。
 * このアプリの利用者が使う接続元（claude.ai のコネクタと Claude Code 等のローカル
 * クライアント）以外は、登録・取得の段階で拒否する。使う接続元が増えたらここに足す。
 */

/** DCR で許可する戻り先（https）。パスまで完全一致で比較する。 */
const ALLOWED_HTTPS_REDIRECTS = new Set([
  "https://claude.ai/api/mcp/auth_callback",
  "https://claude.com/api/mcp/auth_callback",
]);

/** CIMD で取得してよい client_id（メタデータ文書の URL）のオリジン。 */
const ALLOWED_CIMD_ORIGINS = new Set(["https://claude.ai", "https://claude.com"]);

const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

/** http の loopback（ポート・パスは任意）か。ローカルクライアント（RFC 8252）の戻り先。 */
export function isHttpLoopback(uri: unknown): boolean {
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

/** DCR の戻り先として許可するか（許可リストの https、または http の loopback）。 */
export function isAllowedRedirectUri(uri: unknown): boolean {
  return (typeof uri === "string" && ALLOWED_HTTPS_REDIRECTS.has(uri)) || isHttpLoopback(uri);
}

/** CIMD の client_id URL を取得してよいか（許可オリジンの https URL のみ）。 */
export function isAllowedCimdClientId(clientIdUrl: string): boolean {
  try {
    const url = new URL(clientIdUrl);
    return url.protocol === "https:" && ALLOWED_CIMD_ORIGINS.has(url.origin);
  } catch {
    return false;
  }
}
