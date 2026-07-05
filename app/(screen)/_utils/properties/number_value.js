/**
 * Notionの数値系プロパティから数値を安全に取り出す。
 *
 * 「単価」のようにプロパティの型を後から変更（例: rollup → number）しても
 * 壊れないよう、number / formula(number) / rollup(number) /
 * rollup(array of number|formula) のいずれの形でも読み取れるようにする。
 * どの形でも取得できない場合は fallback を返す。
 *
 * @param {object} prop Notionのプロパティオブジェクト
 * @param {number|null} [fallback=null] 取得できなかった場合の戻り値
 * @return {number|null} 取り出した数値、または fallback
 */
export const number_value = (prop, fallback = null) => {
  if (!prop || typeof prop !== 'object') {
    return fallback;
  }

  switch (prop.type) {
    case 'number':
      return typeof prop.number === 'number' ? prop.number : fallback;

    case 'formula':
      return prop.formula?.type === 'number' &&
        typeof prop.formula.number === 'number'
        ? prop.formula.number
        : fallback;

    case 'rollup': {
      const rollup = prop.rollup;
      if (!rollup) {
        return fallback;
      }
      if (rollup.type === 'number') {
        return typeof rollup.number === 'number' ? rollup.number : fallback;
      }
      if (rollup.type === 'array') {
        const first = rollup.array?.find(Boolean);
        return first ? number_value(first, fallback) : fallback;
      }
      return fallback;
    }

    default:
      return fallback;
  }
};
