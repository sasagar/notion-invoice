import { createHash, timingSafeEqual } from "node:crypto";

/**
 * 常駐エージェント（画面がなく OAuth の同意を回せないクライアント）用の固定トークン。
 * サーバーには SHA-256 だけを置き（MCP_AGENT_TOKEN_SHA256）、平文はクライアント側にだけ持たせる。
 * OAuth のアクセストークン（JWT）は `.` を含むので、固定トークン（hex）と取り違えない。
 */
export function matchesAgentToken(
  authorization: string | null,
  expectedSha256Hex: string | undefined,
): boolean {
  const expected = expectedSha256Hex?.trim().toLowerCase() ?? "";
  if (!/^[0-9a-f]{64}$/.test(expected)) {
    return false;
  }
  const m = /^Bearer\s+(\S+)$/i.exec(authorization ?? "");
  if (!m) {
    return false;
  }
  const actual = createHash("sha256").update(m[1]!).digest();
  return timingSafeEqual(actual, Buffer.from(expected, "hex"));
}
