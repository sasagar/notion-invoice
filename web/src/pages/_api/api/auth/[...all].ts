import { auth } from "@/lib/auth";
import { gateMcpClientRegistration } from "@/lib/mcp/oauth-registration";

// /api/auth/* の全メソッドを better-auth のハンドラへ委譲（default = catch-all）。
// MCP の動的クライアント登録だけ、許可リスト外の戻り先を拒否し、ローカルクライアント向けに
// application_type を補正する（oauth-registration.ts）。
export default async function handler(req: Request): Promise<Response> {
  const gated = await gateMcpClientRegistration(req);
  if (gated instanceof Response) {
    return gated;
  }
  return auth.handler(gated);
}
