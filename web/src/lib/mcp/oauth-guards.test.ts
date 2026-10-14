import Database from "better-sqlite3";
import { beforeEach, describe, expect, it } from "vitest";
import { forceConsent, rejectUnconsentedCode } from "@/lib/mcp/oauth-guards";
import type { AppDatabase } from "@/lib/schema";

const B = "http://localhost:3000";

describe("forceConsent", () => {
  it("authorize に prompt=consent を付ける（none 等の指定も上書き）", () => {
    for (const q of ["client_id=c", "client_id=c&prompt=none", "client_id=c&prompt=login"]) {
      const out = forceConsent(new Request(`${B}/api/auth/mcp/authorize?${q}`));
      const url = new URL(out.url);
      expect(url.searchParams.get("prompt")).toBe("consent");
      expect(url.searchParams.get("client_id")).toBe("c");
    }
  });

  it("authorize 以外は素通し", () => {
    const req = new Request(`${B}/api/auth/sign-in/email`, { method: "POST" });
    expect(forceConsent(req)).toBe(req);
  });
});

describe("rejectUnconsentedCode", () => {
  let db: AppDatabase;
  beforeEach(() => {
    db = new Database(":memory:");
    db.exec("CREATE TABLE verification (identifier TEXT, value TEXT)");
    db.prepare("INSERT INTO verification VALUES (?, ?)").run(
      "pending",
      JSON.stringify({ requireConsent: true }),
    );
    db.prepare("INSERT INTO verification VALUES (?, ?)").run(
      "granted",
      JSON.stringify({ requireConsent: false }),
    );
  });

  const tokenReq = (code: string, json = false) =>
    new Request(`${B}/api/auth/mcp/token`, {
      method: "POST",
      headers: { "content-type": json ? "application/json" : "application/x-www-form-urlencoded" },
      body: json
        ? JSON.stringify({ grant_type: "authorization_code", code })
        : `grant_type=authorization_code&code=${code}`,
    });

  it("同意前コードは form / JSON とも 400", async () => {
    expect((await rejectUnconsentedCode(db, tokenReq("pending")))?.status).toBe(400);
    expect((await rejectUnconsentedCode(db, tokenReq("pending", true)))?.status).toBe(400);
  });

  it("同意済み・未知のコードは通し、本体は後段で読める", async () => {
    const req = tokenReq("granted");
    expect(await rejectUnconsentedCode(db, req)).toBeNull();
    expect(await req.text()).toContain("code=granted");
    expect(await rejectUnconsentedCode(db, tokenReq("unknown"))).toBeNull();
  });

  it("refresh_token やトークン以外のパスは対象外", async () => {
    const refresh = new Request(`${B}/api/auth/mcp/token`, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: "grant_type=refresh_token&refresh_token=pending",
    });
    expect(await rejectUnconsentedCode(db, refresh)).toBeNull();
    const other = new Request(`${B}/api/auth/sign-in/email`, { method: "POST", body: "{}" });
    expect(await rejectUnconsentedCode(db, other)).toBeNull();
  });
});
