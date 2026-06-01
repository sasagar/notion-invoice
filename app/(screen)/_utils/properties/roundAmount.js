/**
 * 金額を四捨五入して整数に丸める。
 *
 * 単価 × 数量 の計算で数量が小数の場合、小計が小数になることがあるため、
 * 表示・集計の前にこの関数で丸める。負数（値引きなど）は絶対値で
 * 四捨五入してから符号を戻すことで、0からの距離で四捨五入する。
 *
 * @param {number} value 丸める金額
 * @return {number} 四捨五入した整数
 */
export const roundAmount = value => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 0;
  }
  return Math.sign(value) * Math.round(Math.abs(value));
};
