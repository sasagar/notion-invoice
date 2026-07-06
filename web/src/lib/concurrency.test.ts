import { describe, expect, test } from "vitest";
import { mapWithConcurrency } from "@/lib/concurrency";

describe("mapWithConcurrency", () => {
  test("全要素を順序通りの結果で処理する", async () => {
    const result = await mapWithConcurrency([1, 2, 3, 4, 5], 2, async (n) => n * 10);
    expect(result).toEqual([10, 20, 30, 40, 50]);
  });

  test("同時実行数が limit を超えない", async () => {
    let inFlight = 0;
    let maxInFlight = 0;
    await mapWithConcurrency(
      Array.from({ length: 10 }, (_, i) => i),
      3,
      async (n) => {
        inFlight++;
        maxInFlight = Math.max(maxInFlight, inFlight);
        await new Promise((r) => setTimeout(r, 5));
        inFlight--;
        return n;
      },
    );
    expect(maxInFlight).toBeLessThanOrEqual(3);
  });

  test("limit が要素数より多くても全件処理する", async () => {
    const result = await mapWithConcurrency([1, 2], 10, async (n) => n);
    expect(result).toEqual([1, 2]);
  });

  test("空配列は空配列を返す", async () => {
    const result = await mapWithConcurrency([], 3, async (n: number) => n);
    expect(result).toEqual([]);
  });

  test("処理中の例外は呼び出し元に伝播する", async () => {
    await expect(
      mapWithConcurrency([1, 2, 3], 2, async (n) => {
        if (n === 2) {
          throw new Error("boom");
        }
        return n;
      }),
    ).rejects.toThrow("boom");
  });
});
