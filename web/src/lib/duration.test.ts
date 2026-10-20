import { describe, expect, test } from "vitest";
import {
  formatQuantity,
  hoursToMinutes,
  parseHoursMinutes,
  toHoursMinutesInput,
} from "@/lib/duration";

describe("parseHoursMinutes", () => {
  test("時:分を時間の小数にする（全角コロンも可）", () => {
    expect(parseHoursMinutes("1:30")).toBe(1.5);
    expect(parseHoursMinutes("0:05")).toBeCloseTo(5 / 60, 12);
    expect(parseHoursMinutes(" 2：00 ")).toBe(2);
    expect(parseHoursMinutes("1:5")).toBeCloseTo(1 + 5 / 60, 12);
  });

  test("60 分以上や形式違いは null", () => {
    expect(parseHoursMinutes("1:60")).toBeNull();
    expect(parseHoursMinutes("1.5")).toBeNull();
    expect(parseHoursMinutes("1:")).toBeNull();
    expect(parseHoursMinutes("-1:00")).toBeNull();
  });
});

describe("hoursToMinutes", () => {
  test("80/60 のような誤差を含む値も分に戻せる", () => {
    expect(hoursToMinutes(80 / 60)).toBe(80);
    expect(hoursToMinutes(1.25)).toBe(75);
    expect(hoursToMinutes(1.234)).toBeNull();
  });
});

describe("toHoursMinutesInput", () => {
  test("入力欄用に h:mm へ", () => {
    expect(toHoursMinutesInput(1.5)).toBe("1:30");
    expect(toHoursMinutesInput(80 / 60)).toBe("1:20");
    expect(toHoursMinutesInput(0)).toBe("0:00");
    expect(toHoursMinutesInput(1.234)).toBe("1.234");
  });
});

describe("formatQuantity", () => {
  test("時間は「1時間30分」形式（ちょうどなら分を省く、1時間未満は分のみ）", () => {
    expect(formatQuantity(1.5, "時間")).toBe("1時間30分");
    expect(formatQuantity(2, "時間")).toBe("2時間");
    expect(formatQuantity(0.75, "時間")).toBe("45分");
    expect(formatQuantity(80 / 60, "時間")).toBe("1時間20分");
  });

  test("分単位で表せない時間や他の単位は従来の表記", () => {
    expect(formatQuantity(1.234, "時間")).toBe("1.234 時間");
    expect(formatQuantity(1200, "件")).toBe("1,200 件");
    expect(formatQuantity(3, "")).toBe("3");
  });
});
