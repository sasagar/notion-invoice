import { requireMcpAuth } from "@better-auth/mcp";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { auth, MCP_RESOURCE } from "@/lib/auth";
import { createInvoiceMcpServer } from "@/lib/mcp/server";

// MCP の Streamable HTTP エンドポイント（/api/mcp）。アクセストークン（JWT）の署名・
// issuer・audience(=MCP_RESOURCE)・有効期限を requireMcpAuth で検証し（無効なら 401 +
// WWW-Authenticate で認可フローへ誘導）、sub(=userId) を束縛したサーバーを作るステートレス運用。
const handle = requireMcpAuth(
  auth,
  async (req, claims) => {
    if (typeof claims.sub !== "string" || claims.sub === "") {
      return Response.json({ error: "invalid_token" }, { status: 401 });
    }
    const server = createInvoiceMcpServer(claims.sub);
    // sessionIdGenerator 省略 = ステートレス（セッション ID を発行しない）。
    const transport = new WebStandardStreamableHTTPServerTransport({ enableJsonResponse: true });
    await server.connect(transport);
    try {
      return await transport.handleRequest(req);
    } finally {
      await server.close();
    }
  },
  { resource: MCP_RESOURCE },
);

export default async function handler(req: Request): Promise<Response> {
  return handle(req);
}
