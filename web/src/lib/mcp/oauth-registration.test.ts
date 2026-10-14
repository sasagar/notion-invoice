import { describe, expect, it } from "vitest";
import { gateMcpClientRegistration } from "@/lib/mcp/oauth-registration";

const URL_ = "http://localhost:3000/api/auth/oauth2/register";

function register(body: unknown, url = URL_): Request {
  return new Request(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function gate(body: unknown): Promise<Request | Response> {
  return gateMcpClientRegistration(register(body));
}

async function applicationTypeOf(body: unknown): Promise<unknown> {
  const out = await gate(body);
  if (out instanceof Response) {
    throw new Error(`rejected: ${await out.text()}`);
  }
  return ((await out.json()) as Record<string, unknown>)["application_type"];
}

describe("gateMcpClientRegistration: 許可制", () => {
  it("許可リスト外の戻り先を含む登録は 400 invalid_redirect_uri", async () => {
    for (const uris of [
      ["https://evil.example/cb"],
      ["http://localhost:1/cb", "https://evil.example/cb"],
      ["https://claude.ai/api/mcp/auth_callback/../evil"],
      ["https://claude.ai.evil.example/api/mcp/auth_callback"],
      ["http://localhost.evil.example/cb"],
    ]) {
      const out = await gate({ redirect_uris: uris });
      expect(out).toBeInstanceOf(Response);
      const res = out as Response;
      expect(res.status).toBe(400);
      expect(((await res.json()) as { error: string }).error).toBe("invalid_redirect_uri");
    }
  });

  it("claude.ai / claude.com のコールバックは通す（web のまま）", async () => {
    for (const uri of [
      "https://claude.ai/api/mcp/auth_callback",
      "https://claude.com/api/mcp/auth_callback",
    ]) {
      expect(await applicationTypeOf({ redirect_uris: [uri] })).toBeUndefined();
    }
  });
});

describe("gateMcpClientRegistration: 互換補正", () => {
  it("http loopback のみの登録には native を補う", async () => {
    for (const uri of [
      "http://localhost:53682/callback",
      "http://127.0.0.1:9999/cb",
      "http://[::1]:8080/cb",
    ]) {
      expect(await applicationTypeOf({ redirect_uris: [uri] })).toBe("native");
    }
  });

  it("明示された application_type は尊重する", async () => {
    expect(
      await applicationTypeOf({
        redirect_uris: ["http://localhost:1/cb"],
        application_type: "web",
      }),
    ).toBe("web");
  });

  it("登録以外のリクエストは素通し", async () => {
    const req = register(
      { redirect_uris: ["https://evil.example/cb"] },
      "http://localhost:3000/api/auth/sign-in/email",
    );
    expect(await gateMcpClientRegistration(req)).toBe(req);
  });
});
