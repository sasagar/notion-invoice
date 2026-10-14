import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { withMcpAuth } from "better-auth/plugins";
import { auth } from "@/lib/auth";
import { createInvoiceMcpServer } from "@/lib/mcp/server";

// MCP の Streamable HTTP エンドポイント（/api/mcp）。OAuth アクセストークンを
// withMcpAuth で検証し（無効なら 401 + WWW-Authenticate で認可フローへ誘導）、
// リクエストごとに userId を束縛したサーバーを作るステートレス運用。
const handle = withMcpAuth(auth, async (req, session) => {
  const server = createInvoiceMcpServer(session.userId);
  // sessionIdGenerator 省略 = ステートレス（セッション ID を発行しない）。
  const transport = new WebStandardStreamableHTTPServerTransport({ enableJsonResponse: true });
  await server.connect(transport);
  try {
    return await transport.handleRequest(req);
  } finally {
    await server.close();
  }
});

export default async function handler(req: Request): Promise<Response> {
  return handle(req);
}
