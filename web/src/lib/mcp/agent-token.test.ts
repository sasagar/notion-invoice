import { createHash } from "node:crypto";
import { describe, expect, test } from "vitest";
import { matchesAgentToken } from "@/lib/mcp/agent-token";

const token = "a".repeat(64);
const hash = createHash("sha256").update(token).digest("hex");

describe("matchesAgentToken（常駐エージェント用の固定トークン）", () => {
  test("ハッシュが一致すれば許可", () => {
    expect(matchesAgentToken(`Bearer ${token}`, hash)).toBe(true);
    expect(matchesAgentToken(`bearer ${token}`, hash.toUpperCase())).toBe(true);
  });
  test("違うトークンは拒否", () => {
    expect(matchesAgentToken(`Bearer ${"b".repeat(64)}`, hash)).toBe(false);
  });
  test("未設定・形式違いの設定では常に拒否（fail closed）", () => {
    expect(matchesAgentToken(`Bearer ${token}`, undefined)).toBe(false);
    expect(matchesAgentToken(`Bearer ${token}`, "")).toBe(false);
    // ハッシュの代わりに平文を置いても通らない
    expect(matchesAgentToken(`Bearer ${token}`, token)).toBe(false);
    expect(matchesAgentToken(`Bearer ${token}`, "abc")).toBe(false);
  });
  test("Bearer でないヘッダーやヘッダーなしは拒否", () => {
    expect(matchesAgentToken(null, hash)).toBe(false);
    expect(matchesAgentToken(token, hash)).toBe(false);
    expect(matchesAgentToken(`Basic ${token}`, hash)).toBe(false);
  });
});
