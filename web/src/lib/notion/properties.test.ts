import { describe, expect, test } from "vitest";
import {
  checkbox,
  dateStart,
  numberValue,
  plainText,
  relationIds,
  rollupTextList,
} from "@/lib/notion/properties";

describe("Notion プロパティ抽出（型変更・欠損に強い）", () => {
  test("plainText: title/rich_text/status/select/欠損", () => {
    expect(plainText({ type: "title", title: [{ plain_text: "あ" }, { plain_text: "い" }] })).toBe(
      "あい",
    );
    expect(plainText({ type: "rich_text", rich_text: [{ plain_text: "x" }] })).toBe("x");
    expect(plainText({ type: "status", status: { name: "下書き" } })).toBe("下書き");
    expect(plainText({ type: "select", select: { name: "A" } })).toBe("A");
    expect(plainText(undefined)).toBe("");
    expect(plainText({ type: "number", number: 3 })).toBe("");
  });

  test("numberValue: number/formula/rollup(number|array)/欠損", () => {
    expect(numberValue({ type: "number", number: 1000 })).toBe(1000);
    expect(numberValue({ type: "formula", formula: { type: "number", number: 42 } })).toBe(42);
    expect(numberValue({ type: "rollup", rollup: { type: "number", number: 7 } })).toBe(7);
    expect(
      numberValue({
        type: "rollup",
        rollup: { type: "array", array: [{ type: "number", number: 5 }] },
      }),
    ).toBe(5);
    // 単価が rollup→number へ変わっても壊れない（今回のバグの根本対策）
    expect(numberValue({ type: "number", number: 250 })).toBe(250);
    expect(numberValue(undefined)).toBe(0);
    expect(numberValue(undefined, -1)).toBe(-1);
  });

  test("rollupTextList: 複数の項目名", () => {
    expect(
      rollupTextList({
        type: "rollup",
        rollup: {
          type: "array",
          array: [
            { type: "title", title: [{ plain_text: "項目A" }] },
            { type: "title", title: [{ plain_text: "項目B" }] },
          ],
        },
      }),
    ).toEqual(["項目A", "項目B"]);
    expect(rollupTextList(undefined)).toEqual([]);
  });

  test("checkbox / dateStart / relationIds", () => {
    expect(checkbox({ type: "checkbox", checkbox: true })).toBe(true);
    expect(checkbox({ type: "checkbox", checkbox: false })).toBe(false);
    expect(checkbox(undefined)).toBe(false);
    expect(dateStart({ type: "date", date: { start: "2026-07-05" } })).toBe("2026-07-05");
    expect(dateStart({ type: "date", date: null })).toBe(null);
    expect(relationIds({ type: "relation", relation: [{ id: "a" }, { id: "b" }] })).toEqual([
      "a",
      "b",
    ]);
    expect(relationIds(undefined)).toEqual([]);
  });
});
