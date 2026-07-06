/**
 * 明細行の税率別対象額を導出する純粋関数。
 * Notion 側の formula（小計・10%/8%/非課税対象額）と等価な計算を再現する。
 * 丸めはここでは行わない（既存 computeTotals 側の roundAmount が担当する）。
 */
import type { LineAmounts } from "@/lib/money/sanitizer";

/**
 * 単価・数量・税率から、税率別の対象額と小計を求める。
 * 未知の税率文字列は 3 バケットとも 0 になり（小計のみ値を持つ）、
 * importer のパリティ検証で検出できるようにする。
 */
export function deriveLineAmounts(
  unitPrice: number,
  quantity: number,
  taxRate: string,
): LineAmounts {
  const subtotal = unitPrice * quantity;
  return {
    amount10: taxRate === "10%" ? subtotal : 0,
    amount8: taxRate === "8%" ? subtotal : 0,
    amount0: taxRate === "非課税" ? subtotal : 0,
    subtotal,
  };
}
