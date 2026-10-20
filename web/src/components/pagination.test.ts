import { describe, expect, test } from "vitest";
import { pageWindow } from "@/components/pagination";

describe("pageWindow", () => {
  test("少ないページは全部出す", () => {
    expect(pageWindow(1, 3)).toEqual([1, 2, 3]);
  });

  test("離れたページは省略記号でつなぐ", () => {
    expect(pageWindow(1, 10)).toEqual([1, 2, 3, "gap", 10]);
    expect(pageWindow(6, 12)).toEqual([1, "gap", 4, 5, 6, 7, 8, "gap", 12]);
    expect(pageWindow(4, 6)).toEqual([1, 2, 3, 4, 5, 6]);
  });
});
