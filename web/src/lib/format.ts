import { Temporal } from "temporal-polyfill";

const WEEKDAY_KANJI = ["月", "火", "水", "木", "金", "土", "日"];

function toPlainDate(iso: string): Temporal.PlainDate | null {
  try {
    return Temporal.PlainDate.from(iso);
  } catch {
    // last_edited_time 等、UTC(Z)瞬間時刻は Instant としてパースし、
    // 業務時間帯(Asia/Tokyo)のカレンダー日付に変換する。
    try {
      return Temporal.Instant.from(iso).toZonedDateTimeISO("Asia/Tokyo").toPlainDate();
    } catch {
      return null;
    }
  }
}

/** ISO 日付を「yyyy年M月d日」で整形（無効/空なら空文字、パース不能なら原文字列）。 */
export function formatDate(iso: string | null): string {
  if (!iso) {
    return "";
  }
  const d = toPlainDate(iso);
  if (!d) {
    return iso;
  }
  return `${d.year}年${d.month}月${d.day}日`;
}

function toZonedDateTime(iso: string): Temporal.ZonedDateTime | null {
  try {
    return Temporal.Instant.from(iso).toZonedDateTimeISO("Asia/Tokyo");
  } catch {
    return null;
  }
}

/** ISO 瞬間時刻を「yyyy年M月d日 HH:mm:ss」で整形(Asia/Tokyo)。last_edited_time 用。 */
export function formatDateTime(iso: string | null): string {
  if (!iso) {
    return "";
  }
  const zdt = toZonedDateTime(iso);
  if (!zdt) {
    return iso;
  }
  const hh = String(zdt.hour).padStart(2, "0");
  const mm = String(zdt.minute).padStart(2, "0");
  const ss = String(zdt.second).padStart(2, "0");
  return `${zdt.year}年${zdt.month}月${zdt.day}日 ${hh}:${mm}:${ss}`;
}

/** 金額を円表記に整形。負数は ▲ 付き。 */
export function formatYen(n: number): string {
  const abs = Math.abs(Math.round(n)).toLocaleString("ja-JP");
  return n < 0 ? `▲ ¥${abs}` : `¥${abs}`;
}

/** ISO 日付を「yyyy年M月d日 (曜)」で整形（PDF 用、旧 dateFormat 相当）。 */
export function formatDateLong(iso: string | null): string {
  if (!iso) {
    return "";
  }
  const d = toPlainDate(iso);
  if (!d) {
    return iso;
  }
  return `${d.year}年${d.month}月${d.day}日 (${WEEKDAY_KANJI[d.dayOfWeek - 1]})`;
}
