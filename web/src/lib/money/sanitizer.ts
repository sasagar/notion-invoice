/**
 * 請求金額の計算（税・源泉徴収・丸め）。Notion に依存しない純粋関数。
 * 旧 invoiceSanitizer.js のロジックを厳密移植したもの。
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

/**
 * 金額を整数に丸める（既定は四捨五入）。負数は絶対値で丸めてから符号を戻す
 * （0 からの距離で丸める。値引き行の切り捨て/切り上げも金額の大きさ基準で対称）。
 */
export function roundAmount(value: number, mode: RoundingMode = "round"): number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return 0;
  }
  return Math.sign(value) * ROUNDERS[mode](Math.abs(value));
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

  const tax10 = taxIncluded ? sum10 - Math.floor(sum10 / 1.1) : Math.floor(sum10 * 0.1);
  const tax8 = taxIncluded ? sum8 - Math.floor(sum8 / 1.08) : Math.floor(sum8 * 0.08);
  const tax = tax10 + tax8;

  let withholding: number;
  if (withholdingExempt) {
    withholding = 0;
  } else if (taxIncluded) {
    withholding = Math.floor((sum10 + sum8 - tax10 - tax8) * 0.1021) * -1;
  } else {
    withholding = Math.floor((sum10 + sum8) * 0.1021) * -1;
  }

  const invoiceSum = taxIncluded ? sum + withholding : sum + tax10 + tax8 + withholding;

  return { sum10, sum8, sum0, tax10, tax8, tax, sum, withholding, invoiceSum };
}
