import type { MiddlewareHandler } from "hono";
import { auth } from "@/lib/auth";

// MCP クライアントが OAuth 設定を発見するためのメタデータをオリジン直下で返す。
// 応答自体は better-auth（oauth-provider / mcp プラグインの onRequest）が生成するので、
// /api/auth 配下に来ない /.well-known/* をそのまま auth.handler へ橋渡しする。
// RFC 8414/9728 のパス付き形式（例: /.well-known/oauth-protected-resource/api/mcp）も含む。
const DISCOVERY_PREFIXES = [
  "/.well-known/oauth-authorization-server",
  "/.well-known/oauth-protected-resource",
  "/.well-known/openid-configuration",
];

export default (): MiddlewareHandler => async (c, next) => {
  if (DISCOVERY_PREFIXES.some((p) => c.req.path.startsWith(p))) {
    return auth.handler(c.req.raw);
  }
  await next();
};
