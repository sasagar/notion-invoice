import { format, parseISO } from "date-fns";
import { ja } from "date-fns/locale";

/** ISO 日付を「yyyy年M月d日」で整形（無効/空なら空文字）。 */
export function formatDate(iso: string | null): string {
  if (!iso) {
    return "";
  }
  try {
    return format(parseISO(iso), "yyyy年M月d日", { locale: ja });
  } catch {
    return iso;
  }
}

/** 金額を円表記に整形。負数は ▲ 付き。 */
export function formatYen(n: number): string {
  const abs = Math.abs(Math.round(n)).toLocaleString("ja-JP");
  return n < 0 ? `▲ ¥${abs}` : `¥${abs}`;
}
