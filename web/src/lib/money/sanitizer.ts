/**
 * 請求金額の計算（税・源泉徴収・丸め）。Notion に依存しない純粋関数。
 * 旧 invoiceSanitizer.js のロジックを移植したもの（内税の浮動小数誤差のみ修正済み）。
 */

export type LineAmounts = {
  amount10: number; // 10%対象額
  amount8: number; // 8%対象額
  amount0: number; // 非課税対象額
  subtotal: number; // 小計
};

/** 行金額（小計・対象額）の丸め方式。負数（値引き行）は絶対値で丸めて符号を戻す。 */
export type RoundingMode = "round" | "floor" | "ceil";

/**
 * 計算に渡す 1 行分の金額。行ごとに丸め方式を上書きできる（`rounding` 省略時は
 * 請求書の既定 = input.rounding を継承）。LineAmounts 単体もそのまま受かる（後方互換）。
 */
export type SanitizerRow = LineAmounts & { rounding?: RoundingMode };

export type SanitizerInput = {
  rows: SanitizerRow[];
  taxIncluded: boolean; // 内税
  withholdingExempt: boolean; // 源泉徴収非対象
  rounding?: RoundingMode; // 請求書既定の丸め方式（省略時は四捨五入=従来挙動）
};

export type InvoiceTotals = {
  sum10: number;
  sum8: number;
  sum0: number;
  tax10: number;
  tax8: number;
  tax: number;
  sum: number;
  withholding: number; // 源泉徴収（負値）
  invoiceSum: number; // 請求額合計
};

const ROUNDERS: Record<RoundingMode, (v: number) => number> = {
  round: Math.round,
  floor: Math.floor,
  ceil: Math.ceil,
};

// 丸める前に 100 万分の 1 円単位へそろえ、浮動小数の誤差を消す。
// 例: 6000 × (70/60) 時間 = 7000.000000000001 を切り上げで 7001 にしない。
const AMOUNT_PRECISION = 1e6;

/**
 * 金額を整数に丸める（既定は四捨五入）。負数は絶対値で丸めてから符号を戻す
 * （0 からの距離で丸める。値引き行の切り捨て/切り上げも金額の大きさ基準で対称）。
 */
export function roundAmount(value: number, mode: RoundingMode = "round"): number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return 0;
  }
  const abs = Math.round(Math.abs(value) * AMOUNT_PRECISION) / AMOUNT_PRECISION;
  return Math.sign(value) * ROUNDERS[mode](abs);
}

/** 源泉徴収の税率が切り替わる支払額（円）。 */
export const WITHHOLDING_THRESHOLD = 1_000_000;

/**
 * 報酬（税抜）に対する源泉徴収税額（正の値、1 円未満切り捨て）。
 * 100 万円以下の部分は 10.21%、100 万円を超える部分は 20.42%（所得税法 204 条＋復興特別所得税）。
 * 浮動小数の誤差を避けるため、率は 1 万分率の整数で掛けてから割る。
 */
export function withholdingTax(base: number): number {
  if (base <= WITHHOLDING_THRESHOLD) {
    return Math.floor((base * 1021) / 10000);
  }
  // 100 万円までの 102,100 円 ＋ 超過分の 20.42%
  return (
    (WITHHOLDING_THRESHOLD * 1021) / 10000 +
    Math.floor(((base - WITHHOLDING_THRESHOLD) * 2042) / 10000)
  );
}

/**
 * 行ごとの対象額と内税/源泉フラグから請求額の内訳を計算する。
 */
export function computeTotals(input: SanitizerInput): InvoiceTotals {
  const { rows, taxIncluded, withholdingExempt, rounding = "round" } = input;

  // 有効な丸め = 行の上書き（r.rounding）→ 請求書既定（rounding）の順で解決する。
  const eff = (r: SanitizerRow): RoundingMode => r.rounding ?? rounding;
  const sum10 = rows.reduce((a, r) => a + roundAmount(r.amount10, eff(r)), 0);
  const sum8 = rows.reduce((a, r) => a + roundAmount(r.amount8, eff(r)), 0);
  const sum0 = rows.reduce((a, r) => a + roundAmount(r.amount0, eff(r)), 0);
  const sum = rows.reduce((a, r) => a + roundAmount(r.subtotal, eff(r)), 0);

  // 内税の税抜額は整数どうしの比で求める。`x / 1.1` は 1.1 が 2 進で表せないため
  // 110000 / 1.1 = 99999.99… となり、floor で税抜が 1 円減る（→ 税 +1・源泉 -1）。
  const tax10 = taxIncluded ? sum10 - Math.floor((sum10 * 10) / 11) : Math.floor(sum10 * 0.1);
  const tax8 = taxIncluded ? sum8 - Math.floor((sum8 * 100) / 108) : Math.floor(sum8 * 0.08);
  const tax = tax10 + tax8;

  // 源泉の対象は課税対象額の税抜（非課税行は対象外）。内税なら税込から税を引く。
  const withholdingBase = taxIncluded ? sum10 + sum8 - tax10 - tax8 : sum10 + sum8;
  const withholding = withholdingExempt ? 0 : -withholdingTax(withholdingBase);

  const invoiceSum = taxIncluded ? sum + withholding : sum + tax10 + tax8 + withholding;

  return { sum10, sum8, sum0, tax10, tax8, tax, sum, withholding, invoiceSum };
}
