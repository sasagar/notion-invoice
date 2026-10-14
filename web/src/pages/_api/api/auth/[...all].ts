import { auth } from "@/lib/auth";
import { normalizeMcpClientRegistration } from "@/lib/mcp/oauth-registration";

// /api/auth/* の全メソッドを better-auth のハンドラへ委譲（default = catch-all）。
// MCP の動的クライアント登録だけ、ローカルクライアント向けに application_type を補正する。
export default async function handler(req: Request): Promise<Response> {
  return auth.handler(await normalizeMcpClientRegistration(req));
}
