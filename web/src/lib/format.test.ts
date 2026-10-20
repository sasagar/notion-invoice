import { describe, expect, test } from "vitest";
import { Temporal } from "temporal-polyfill";
import { formatDate, formatDateLong, formatDateTime, formatYen, todayInTokyo } from "@/lib/format";

describe("formatDate", () => {
  test("日付のみのISO文字列を整形する", () => {
    expect(formatDate("2026-07-05")).toBe("2026年7月5日");
    expect(formatDate("2026-01-01")).toBe("2026年1月1日");
  });

  test("時刻付きISO文字列は日付部分のみ整形する", () => {
    expect(formatDate("2026-07-05T00:00:00.000+09:00")).toBe("2026年7月5日");
  });

  test("UTC(Z)瞬間時刻はAsia/Tokyoのカレンダー日付に変換する(last_edited_time相当)", () => {
    // 13:17 JST 同日
    expect(formatDate("2026-07-05T04:17:00.000Z")).toBe("2026年7月5日");
    // 01:00 JST に日付が繰り上がるケース
    expect(formatDate("2026-07-04T16:00:00.000Z")).toBe("2026年7月5日");
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

describe("formatDateTime", () => {
  test("UTC(Z)瞬間時刻をAsia/Tokyoの日時に変換し時分まで整形する", () => {
    expect(formatDateTime("2026-07-05T04:17:00.000Z")).toBe("2026年7月5日 13:17");
  });

  test("UTC深夜跨ぎでJSTの日付が繰り上がる", () => {
    expect(formatDateTime("2026-07-04T16:00:00.000Z")).toBe("2026年7月5日 01:00");
  });

  test("時分は2桁ゼロ埋めする", () => {
    expect(formatDateTime("2026-01-01T00:05:09.000Z")).toBe("2026年1月1日 09:05");
  });

  test("SQLite の datetime('now')（UTC・表記なし）も JST に変換する", () => {
    expect(formatDateTime("2026-10-20 13:21:10")).toBe("2026年10月20日 22:21");
    expect(formatDate("2026-10-20 16:00:00")).toBe("2026年10月21日");
  });

  test("null/空文字は空文字、パース不能なら原文字列を返す", () => {
    expect(formatDateTime(null)).toBe("");
    expect(formatDateTime("bogus")).toBe("bogus");
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

describe("todayInTokyo", () => {
  test("UTC の前日夜でも JST の日付を返す", () => {
    expect(todayInTokyo(Temporal.Instant.from("2026-10-19T15:30:00Z"))).toBe("2026-10-20");
    expect(todayInTokyo(Temporal.Instant.from("2026-10-19T14:59:59Z"))).toBe("2026-10-19");
  });
});
