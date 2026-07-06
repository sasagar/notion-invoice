/**
 * SQLite の行（better-sqlite3 は unknown を返す）を、型が不正でも壊れないよう
 * 安全に読み取る最小ヘルパ群。properties.ts と同じ「既定値へフォールバック」方針。
 */

/** unknown をレコードとして扱う。オブジェクトでなければ例外（想定外の行形状）。 */
export function asRow(v: unknown): Record<string, unknown> {
  if (typeof v !== "object" || v === null) {
    throw new Error("DB 行が想定外の形式です");
  }
  return v as Record<string, unknown>;
}

/** 文字列カラム。非文字列は空文字。 */
export function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

/** NULL 許容の文字列カラム。文字列以外（NULL 含む）は null。 */
export function strOrNull(v: unknown): string | null {
  return typeof v === "string" ? v : null;
}

/** 数値カラム。非数値は 0。 */
export function num(v: unknown): number {
  return typeof v === "number" ? v : 0;
}

/** INTEGER 0/1 で表す真偽カラム。0 以外の数値を true とみなす。 */
export function boolFromInt(v: unknown): boolean {
  return typeof v === "number" && v !== 0;
}
