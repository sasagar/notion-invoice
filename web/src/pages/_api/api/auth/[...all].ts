import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { forceConsent, rejectUnconsentedCode } from "@/lib/mcp/oauth-guards";

// /api/auth/* の全メソッドを better-auth のハンドラへ委譲（default = catch-all）。
// MCP の OAuth は同意画面を必須にし、同意前コードのトークン交換を拒否する（oauth-guards 参照）。
export default async function handler(req: Request): Promise<Response> {
  const rejected = await rejectUnconsentedCode(db, req);
  if (rejected) {
    return rejected;
  }
  return auth.handler(forceConsent(req));
}
