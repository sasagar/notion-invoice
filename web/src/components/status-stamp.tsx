import type { CSSProperties } from "react";

type Tier = "unstamped" | "transit" | "sealed" | "void";

/** ドラフト＝未捺印、送付済み＝青インク(処理中)、キャンセル＝取消(打ち消し線)、
 *  それ以外(支払い済み等)＝朱肉(確定)。 */
const STATUS_TIER: Record<string, Tier> = {
  ドラフト: "unstamped",
  見積送付済み: "transit",
  請求書送付済み: "transit",
  キャンセル: "void",
};

const TIER_STYLE: Record<Tier, string> = {
  unstamped:
    "border-2 border-dashed border-stone-400/70 text-stone-500 dark:border-slate-600 dark:text-slate-400",
  transit:
    "stamp-mark border-[3px] border-double border-kent-blue-500 text-kent-blue-600 dark:border-kent-blue-300 dark:text-kent-blue-200",
  sealed:
    "stamp-mark border-[3px] border-double border-shuiro-500 text-shuiro-600 dark:border-shuiro-400 dark:text-shuiro-400",
  void: "border-2 border-stone-300 text-stone-400 line-through decoration-2 opacity-80 dark:border-slate-700 dark:text-slate-500",
};

// よくある語尾（意味の区切り）の直前で改行できるようにする。
// 「送付済み」のような複合語は語幹ごと末尾側に残す(長い方から順に判定)。
// 例: 見積送付済み → 見積 / 送付済み、請求書送付済み → 請求書 / 送付済み
const BREAK_SUFFIXES = ["送付済み", "済み", "済", "予定", "中"];

/** 改行を入れるべき位置で [先頭, 末尾] に分割する（無ければ末尾は null）。 */
export function splitForWrap(text: string): [string, string | null] {
  for (const suffix of BREAK_SUFFIXES) {
    if (text.length > suffix.length && text.endsWith(suffix)) {
      return [text.slice(0, -suffix.length), suffix];
    }
  }
  // 既知の語尾が無い長い文字列は、意味の切れ目が分からないので中央で区切る。
  if (text.length >= 5) {
    const mid = Math.ceil(text.length / 2);
    return [text.slice(0, mid), text.slice(mid)];
  }
  return [text, null];
}

/**
 * 検収印風のステータス表示。角印を模した矩形の二重罫線バッジで、
 * 実際の印影（自社情報）と呼応させる意図的な意匠。
 *
 * 実物の印鑑は文字数に関わらず同じ大きさなので、幅・高さは固定。
 * 折り返しは単語（意味）の切れ目でのみ行い、それ以外の位置では
 * 改行しない(word-break: keep-all)。想定外に長い文字列のみ、はみ出し
 * 防止のフォールバックとして任意の位置での折り返しを許可する。
 */
export function StatusStamp({ status, className = "" }: { status: string; className?: string }) {
  const tier: Tier = STATUS_TIER[status] ?? "sealed";
  const [head, tail] = splitForWrap(status || "—");
  return (
    <span
      className={`inline-flex h-10 w-16 shrink-0 items-center justify-center whitespace-normal break-keep break-words rounded-[2px] text-center font-sans text-[9px] font-bold leading-[1.15] tracking-wide ${TIER_STYLE[tier]} ${className}`}
      style={{ "--stamp-rotate": "-6deg" } as CSSProperties}
    >
      {head}
      {tail !== null && (
        <>
          <wbr />
          {tail}
        </>
      )}
    </span>
  );
}
