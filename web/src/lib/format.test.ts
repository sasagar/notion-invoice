import { describe, expect, test } from "vitest";
import { formatDate, formatDateLong, formatYen } from "@/lib/format";

describe("formatDate", () => {
  test("日付のみのISO文字列を整形する", () => {
    expect(formatDate("2026-07-05")).toBe("2026年7月5日");
    expect(formatDate("2026-01-01")).toBe("2026年1月1日");
  });

  test("時刻付きISO文字列は日付部分のみ整形する", () => {
    expect(formatDate("2026-07-05T00:00:00.000+09:00")).toBe("2026年7月5日");
  });

  test("null/空文字は空文字を返す", () => {
    expect(formatDate(null)).toBe("");
    expect(formatDate("")).toBe("");
  });

  test("パース不能な文字列は原文字列を返す", () => {
    expect(formatDate("not-a-date")).toBe("not-a-date");
  });
});

describe("formatDateLong", () => {
  test("曜日付きで整形する", () => {
    expect(formatDateLong("2026-07-05")).toBe("2026年7月5日 (日)");
    expect(formatDateLong("2026-01-01")).toBe("2026年1月1日 (木)");
    expect(formatDateLong("2026-12-31")).toBe("2026年12月31日 (木)");
    expect(formatDateLong("2026-08-09")).toBe("2026年8月9日 (日)");
  });

  test("null/空文字は空文字、パース不能なら原文字列を返す", () => {
    expect(formatDateLong(null)).toBe("");
    expect(formatDateLong("bogus")).toBe("bogus");
  });
});

describe("formatYen", () => {
  test("正の整数をカンマ区切りで整形する", () => {
    expect(formatYen(1000)).toBe("¥1,000");
    expect(formatYen(0)).toBe("¥0");
  });

  test("負数は▲付きで絶対値を表示する", () => {
    expect(formatYen(-500)).toBe("▲ ¥500");
  });

  test("小数は四捨五入する", () => {
    expect(formatYen(1000.6)).toBe("¥1,001");
  });
});
