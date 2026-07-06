import type { CSSProperties } from "react";

type Tier = "unstamped" | "transit" | "sealed";

/** ドラフト＝未捺印、送付済み＝青インク(処理中)、それ以外(支払済み等)＝朱肉(確定)。 */
const STATUS_TIER: Record<string, Tier> = {
  ドラフト: "unstamped",
  見積送付済み: "transit",
  請求書送付済み: "transit",
};

const TIER_STYLE: Record<Tier, string> = {
  unstamped:
    "border-2 border-dashed border-stone-400/70 text-stone-500 dark:border-slate-600 dark:text-slate-400",
  transit:
    "stamp-mark border-[3px] border-double border-kent-blue-500 text-kent-blue-600 dark:border-kent-blue-300 dark:text-kent-blue-200",
  sealed:
    "stamp-mark border-[3px] border-double border-shuiro-500 text-shuiro-600 dark:border-shuiro-400 dark:text-shuiro-400",
};

/**
 * 検収印風のステータス表示。角印を模した矩形の二重罫線バッジで、
 * 実際の印影（自社情報）と呼応させる意図的な意匠。
 *
 * 実物の印鑑は文字数に関わらず同じ大きさなので、幅・高さは固定。
 * 文字数が多いステータスは折り返して収める（一覧で後続テキストの
 * 開始位置がずれないようにするため）。
 */
export function StatusStamp({ status, className = "" }: { status: string; className?: string }) {
  const tier: Tier = STATUS_TIER[status] ?? "sealed";
  return (
    <span
      className={`inline-flex h-10 w-16 shrink-0 items-center justify-center whitespace-normal break-words rounded-[2px] text-center font-sans text-[9px] font-bold leading-[1.15] tracking-wide ${TIER_STYLE[tier]} ${className}`}
      style={{ "--stamp-rotate": "-6deg" } as CSSProperties}
    >
      {status || "—"}
    </span>
  );
}
