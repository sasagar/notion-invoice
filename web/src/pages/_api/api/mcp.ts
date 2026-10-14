import process from "node:process";
import { requireMcpAuth } from "@better-auth/mcp";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { auth, MCP_RESOURCE } from "@/lib/auth";
import { db } from "@/lib/db";
import { matchesAgentToken } from "@/lib/mcp/agent-token";
import { createInvoiceMcpServer } from "@/lib/mcp/server";

/** userId を束縛した MCP サーバーで 1 リクエストを処理する（ステートレス）。 */
async function serve(req: Request, userId: string): Promise<Response> {
  const server = createInvoiceMcpServer(userId);
  // sessionIdGenerator 省略 = ステートレス（セッション ID を発行しない）。
  const transport = new WebStandardStreamableHTTPServerTransport({ enableJsonResponse: true });
  await server.connect(transport);
  try {
    return await transport.handleRequest(req);
  } finally {
    await server.close();
  }
}

// MCP の Streamable HTTP エンドポイント（/api/mcp）。アクセストークン（JWT）の署名・
// issuer・audience(=MCP_RESOURCE)・有効期限を requireMcpAuth で検証し（無効なら 401 +
// WWW-Authenticate で認可フローへ誘導）、sub(=userId) を束縛したサーバーを作るステートレス運用。
const handle = requireMcpAuth(
  auth,
  async (req, claims) => {
    if (typeof claims.sub !== "string" || claims.sub === "") {
      return Response.json({ error: "invalid_token" }, { status: 401 });
    }
    return serve(req, claims.sub);
  },
  { resource: MCP_RESOURCE },
);

/**
 * 常駐エージェント用の固定トークン（MCP_AGENT_TOKEN_SHA256）が一致したときに束縛するユーザー。
 * MCP_AGENT_USER_EMAIL のユーザーを毎回引く（ユーザーを消せば固定トークンも効かなくなる）。
 */
function agentUserId(): string | undefined {
  const email = process.env.MCP_AGENT_USER_EMAIL;
  if (!email) {
    return undefined;
  }
  const row = db.prepare("SELECT id FROM user WHERE email = ?").get(email) as
    | { id: string }
    | undefined;
  return row?.id;
}

export default async function handler(req: Request): Promise<Response> {
  if (matchesAgentToken(req.headers.get("authorization"), process.env.MCP_AGENT_TOKEN_SHA256)) {
    const userId = agentUserId();
    if (!userId) {
      console.error("[mcp] agent token matched but MCP_AGENT_USER_EMAIL user not found");
      return Response.json({ error: "invalid_token" }, { status: 401 });
    }
    return serve(req, userId);
  }
  return handle(req);
}
