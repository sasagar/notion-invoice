import { describe, expect, test } from "vitest";
import { groupDigits, normalizeNumeric } from "@/components/amount-input";

describe("normalizeNumeric", () => {
  test("全角数字とカンマを半角・カンマなしにする", () => {
    expect(normalizeNumeric("１２，３４５")).toBe("12345");
    expect(normalizeNumeric(" 50,000 ")).toBe("50000");
    expect(normalizeNumeric("１．５")).toBe("1.5");
  });
});

describe("groupDigits", () => {
  test("整数部だけを 3 桁区切りにする", () => {
    expect(groupDigits("1234567")).toBe("1,234,567");
    expect(groupDigits("1234.5678")).toBe("1,234.5678");
    expect(groupDigits("-50000")).toBe("-50,000");
    expect(groupDigits("999")).toBe("999");
  });

  test("数値として読めない途中の入力は変えない", () => {
    expect(groupDigits("")).toBe("");
    expect(groupDigits("12.")).toBe("12.");
    expect(groupDigits("-")).toBe("-");
  });
});
