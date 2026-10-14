import { describe, expect, it } from "vitest";
import { normalizeMcpClientRegistration } from "@/lib/mcp/oauth-registration";

const URL_ = "http://localhost:3000/api/auth/oauth2/register";

function register(body: unknown, url = URL_): Request {
  return new Request(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function applicationTypeOf(req: Request): Promise<unknown> {
  const out = await normalizeMcpClientRegistration(req);
  return ((await out.json()) as Record<string, unknown>)["application_type"];
}

describe("normalizeMcpClientRegistration", () => {
  it("http loopback のみの登録には native を補う", async () => {
    for (const uri of [
      "http://localhost:53682/callback",
      "http://127.0.0.1:9999/cb",
      "http://[::1]:8080/cb",
    ]) {
      expect(await applicationTypeOf(register({ redirect_uris: [uri] }))).toBe("native");
    }
  });

  it("https や非 loopback を含む登録は変えない（web のまま）", async () => {
    expect(
      await applicationTypeOf(
        register({ redirect_uris: ["https://claude.ai/api/mcp/auth_callback"] }),
      ),
    ).toBeUndefined();
    expect(
      await applicationTypeOf(
        register({ redirect_uris: ["http://localhost:1/cb", "https://evil.example/cb"] }),
      ),
    ).toBeUndefined();
    expect(
      await applicationTypeOf(register({ redirect_uris: ["http://localhost.evil.example/cb"] })),
    ).toBeUndefined();
  });

  it("明示された application_type は尊重する", async () => {
    expect(
      await applicationTypeOf(
        register({ redirect_uris: ["http://localhost:1/cb"], application_type: "web" }),
      ),
    ).toBe("web");
  });

  it("登録以外のリクエストは素通し", async () => {
    const req = register(
      { redirect_uris: ["http://localhost:1/cb"] },
      "http://localhost:3000/api/auth/sign-in/email",
    );
    expect(await normalizeMcpClientRegistration(req)).toBe(req);
  });
});
