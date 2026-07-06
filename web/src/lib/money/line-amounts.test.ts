import { describe, expect, test } from "vitest";
import { deriveLineAmounts } from "@/lib/money/line-amounts";

describe("deriveLineAmounts（Notion formula と等価）", () => {
  test("10%: 対象額は amount10 のみ", () => {
    expect(deriveLineAmounts(1000, 3, "10%")).toEqual({
      amount10: 3000,
      amount8: 0,
      amount0: 0,
      subtotal: 3000,
    });
  });

  test("8%: 対象額は amount8 のみ", () => {
    expect(deriveLineAmounts(1000, 3, "8%")).toEqual({
      amount10: 0,
      amount8: 3000,
      amount0: 0,
      subtotal: 3000,
    });
  });

  test("非課税: 対象額は amount0 のみ", () => {
    expect(deriveLineAmounts(1000, 3, "非課税")).toEqual({
      amount10: 0,
      amount8: 0,
      amount0: 3000,
      subtotal: 3000,
    });
  });

  test("未知の税率: 3 バケットとも 0、小計のみ値を持つ", () => {
    expect(deriveLineAmounts(1000, 3, "15%")).toEqual({
      amount10: 0,
      amount8: 0,
      amount0: 0,
      subtotal: 3000,
    });
    expect(deriveLineAmounts(1000, 3, "")).toEqual({
      amount10: 0,
      amount8: 0,
      amount0: 0,
      subtotal: 3000,
    });
  });

  test("小数数量: 8000 × 12.5（丸めなし）", () => {
    expect(deriveLineAmounts(8000, 12.5, "10%")).toEqual({
      amount10: 100000,
      amount8: 0,
      amount0: 0,
      subtotal: 100000,
    });
  });

  test("負値（値引き行）はそのまま負のまま", () => {
    expect(deriveLineAmounts(-1000, 1, "10%")).toEqual({
      amount10: -1000,
      amount8: 0,
      amount0: 0,
      subtotal: -1000,
    });
  });

  test("0: すべて 0", () => {
    expect(deriveLineAmounts(0, 0, "10%")).toEqual({
      amount10: 0,
      amount8: 0,
      amount0: 0,
      subtotal: 0,
    });
  });
});
