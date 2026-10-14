import { describe, expect, it } from "vitest";
import { isAllowedCimdClientId, isAllowedRedirectUri } from "@/lib/mcp/client-policy";

describe("isAllowedCimdClientId", () => {
  it("claude.ai / claude.com の https URL は許可", () => {
    expect(isAllowedCimdClientId("https://claude.ai/oauth/claude-code-client-metadata")).toBe(true);
    expect(isAllowedCimdClientId("https://claude.com/oauth/x")).toBe(true);
  });

  it("それ以外のオリジン・http・紛らわしいホストは拒否", () => {
    for (const u of [
      "https://evil.example/meta.json",
      "http://claude.ai/oauth/claude-code-client-metadata",
      "https://claude.ai.evil.example/meta.json",
      "https://evil.example/https://claude.ai/",
      "https://claude.ai:8443/meta.json",
      "not a url",
    ]) {
      expect(isAllowedCimdClientId(u)).toBe(false);
    }
  });
});

describe("isAllowedRedirectUri", () => {
  it("完全一致の https コールバックと http loopback のみ", () => {
    expect(isAllowedRedirectUri("https://claude.ai/api/mcp/auth_callback")).toBe(true);
    expect(isAllowedRedirectUri("http://localhost:1234/callback")).toBe(true);
    expect(isAllowedRedirectUri("https://claude.ai/api/mcp/auth_callback?x=1")).toBe(false);
    expect(isAllowedRedirectUri("https://localhost/cb")).toBe(false);
    expect(isAllowedRedirectUri(42)).toBe(false);
  });
});
