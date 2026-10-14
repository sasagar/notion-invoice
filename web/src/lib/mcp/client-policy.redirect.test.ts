import { describe, expect, it } from "vitest";
import { isAllowedRedirectUri } from "@/lib/mcp/client-policy";

// auth.ts の validateRedirectUri と同じ合成（登録済み一致 && 許可リスト内）。
const validate = (uri: string, defaultResult: boolean) =>
  defaultResult && isAllowedRedirectUri(uri);

describe("認可時の戻り先判定（validateRedirectUri の合成）", () => {
  it("許可リスト外は、登録済みと一致していても拒否（許可制より前に登録された既存クライアント）", () => {
    expect(validate("https://evil.example/cb", true)).toBe(false);
  });

  it("許可リスト内でも、登録済みと一致しなければ拒否", () => {
    expect(validate("https://claude.ai/api/mcp/auth_callback", false)).toBe(false);
    expect(validate("http://localhost:1234/callback", false)).toBe(false);
  });

  it("両方を満たすときだけ許可", () => {
    expect(validate("https://claude.ai/api/mcp/auth_callback", true)).toBe(true);
    expect(validate("http://localhost:53682/callback", true)).toBe(true);
  });
});
