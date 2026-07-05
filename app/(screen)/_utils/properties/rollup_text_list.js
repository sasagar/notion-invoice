import { plain_text } from './plain_text';

/**
 * rollup(array) 型プロパティから、各要素のテキストを配列で取り出す。
 *
 * 「項目名」のように参照先が複数になり得るプロパティでも、先頭要素だけでなく
 * 全ての要素を取得できるようにする。各要素（title / rich_text / select 等）は
 * plain_text で文字列化し、空文字は除外する。
 *
 * @param {object} prop Notionのプロパティオブジェクト
 * @return {string[]} 各要素のテキスト配列
 */
export const rollup_text_list = prop => {
  if (prop?.type !== 'rollup') {
    return [];
  }
  const arr = prop.rollup?.array ?? [];
  return arr.map(el => plain_text(el)).filter(text => text.length > 0);
};
