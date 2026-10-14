import { describe, expect, it } from "vitest";
import { withCimdFetchDiagnostics } from "@/lib/mcp/cimd-transport";

// ホスト名を引かずに済むよう、DNS 部分の失敗も含めてログ文言だけを確認する。
const URL_ = "https://invalid.invalid/meta.json";

describe("withCimdFetchDiagnostics", () => {
  it("成功（速い）はそのまま返しログしない", async () => {
    const logs: string[] = [];
    const res = await withCimdFetchDiagnostics(
      async () => new Response("{}", { status: 200 }),
      (m) => logs.push(m),
    )(URL_);
    expect(res.status).toBe(200);
    expect(logs).toEqual([]);
  });

  it("失敗は所要時間・エラー・DNS をログして同じエラーを投げ直す", async () => {
    const logs: string[] = [];
    const err = Object.assign(new Error("connect ETIMEDOUT"), { code: "ETIMEDOUT" });
    const wrapped = withCimdFetchDiagnostics(
      async () => {
        throw err;
      },
      (m) => logs.push(m),
    );
    await expect(wrapped(URL_)).rejects.toBe(err);
    expect(logs).toHaveLength(1);
    expect(logs[0]).toMatch(
      /^\[cimd\] fetch failed https:\/\/invalid\.invalid\/meta\.json after \d+ms: Error: connect ETIMEDOUT code=ETIMEDOUT dns=\[/,
    );
  });
});
