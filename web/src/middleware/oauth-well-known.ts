import type { MiddlewareHandler } from "hono";
import { oAuthDiscoveryMetadata, oAuthProtectedResourceMetadata } from "better-auth/plugins";
import { auth } from "@/lib/auth";

// MCP クライアントが OAuth 設定を発見するためのメタデータをオリジン直下で返す。
// better-auth は /api/auth 配下にしか生えないため、ここで /.well-known/* を橋渡しする。
// RFC 8414/9728 のパス付き形式（例: /.well-known/oauth-protected-resource/api/mcp）も受ける。
const authorizationServer = oAuthDiscoveryMetadata(auth);
const protectedResource = oAuthProtectedResourceMetadata(auth);

export default (): MiddlewareHandler => async (c, next) => {
  const path = c.req.path;
  if (path.startsWith("/.well-known/oauth-authorization-server")) {
    return authorizationServer(c.req.raw);
  }
  if (path.startsWith("/.well-known/oauth-protected-resource")) {
    return protectedResource(c.req.raw);
  }
  await next();
};
