import { afterEach, describe, expect, test } from "vitest";
import { isAllowedOrigin } from "@/lib/api-auth";

// isAllowedOrigin は req.headers.get のみ参照する。Request 構築時の
// forbidden header ガードを避けるため、guard="none" の Headers を直接渡す。
function reqWith(headers: Record<string, string>): Request {
  return { headers: new Headers(headers) } as unknown as Request;
}

describe("isAllowedOrigin（CSRF Origin 検査）", () => {
  const original = process.env.BETTER_AUTH_URL;
  afterEach(() => {
    if (original === undefined) {
      delete process.env.BETTER_AUTH_URL;
    } else {
      process.env.BETTER_AUTH_URL = original;
    }
  });

  test("Origin が無ければ拒否", () => {
    expect(isAllowedOrigin(reqWith({}))).toBe(false);
  });
  test("Origin のホストが Host と一致すれば許可", () => {
    expect(
      isAllowedOrigin(reqWith({ origin: "https://app.example.com", host: "app.example.com" })),
    ).toBe(true);
  });
  test("Origin のホストが BETTER_AUTH_URL と一致すれば許可（Host 不一致でも）", () => {
    process.env.BETTER_AUTH_URL = "https://app.example.com";
    expect(
      isAllowedOrigin(reqWith({ origin: "https://app.example.com", host: "internal:3080" })),
    ).toBe(true);
  });
  test("どちらとも一致しなければ拒否", () => {
    delete process.env.BETTER_AUTH_URL;
    expect(
      isAllowedOrigin(reqWith({ origin: "https://evil.example.com", host: "app.example.com" })),
    ).toBe(false);
  });
  test("不正な Origin 文字列は拒否", () => {
    expect(isAllowedOrigin(reqWith({ origin: "not-a-url", host: "app.example.com" }))).toBe(false);
  });
});
