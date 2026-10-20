/**
 * 単位「時間」の数量を時:分で扱うための変換。
 * 数量そのものは従来どおり「時間」の小数（1時間20分 = 80/60）で保存・計算する。
 */

/** 時:分で入力・表示する単位。 */
export const HOURS_UNIT = "時間";

// 浮動小数の誤差（80/60 など）を吸収して「何分か」を判定するための許容差。
const MINUTE_EPSILON = 1e-6;

/** 時間の小数を分に直す。分単位で表せない値（1.234 時間など）は null。 */
export function hoursToMinutes(hours: number): number | null {
  const minutes = hours * 60;
  const rounded = Math.round(minutes);
  return Math.abs(minutes - rounded) < MINUTE_EPSILON ? rounded : null;
}

/**
 * 「1:30」「1：30」「0:05」を時間の小数にする。
 * 分は 0〜59 の 1〜2 桁のみ受け付け、形式に合わなければ null。
 */
export function parseHoursMinutes(input: string): number | null {
  const m = /^(\d+)[:：](\d{1,2})$/.exec(input.trim());
  if (!m) {
    return null;
  }
  const minutes = Number(m[2]);
  if (minutes >= 60) {
    return null;
  }
  return Number(m[1]) + minutes / 60;
}

/** 入力欄用の「1:30」表記。分単位で表せない値は小数のまま返す。 */
export function toHoursMinutesInput(hours: number): string {
  const total = hoursToMinutes(hours);
  if (total === null || total < 0) {
    return String(hours);
  }
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

/**
 * 画面・PDF 用の数量表記。単位が「時間」で分単位に収まるときは「1時間30分」「2時間」「45分」、
 * それ以外は従来どおり「数量 単位」。
 */
export function formatQuantity(quantity: number, unit: string): string {
  if (unit === HOURS_UNIT) {
    const total = hoursToMinutes(quantity);
    if (total !== null && total > 0) {
      const h = Math.floor(total / 60);
      const m = total % 60;
      return `${h > 0 ? `${h}時間` : ""}${m > 0 ? `${m}分` : ""}`;
    }
  }
  const n = quantity.toLocaleString("ja-JP");
  return unit ? `${n} ${unit}` : n;
}
