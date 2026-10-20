"use client";

import { type InputHTMLAttributes, useState } from "react";

/** 全角数字・記号を半角にし、桁区切りのカンマを取り除く（IME 入力のまま貼られても通す）。 */
export function normalizeNumeric(raw: string): string {
  return raw
    .replace(/[０-９．－]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .replace(/[,，、]/g, "")
    .trim();
}

/** 数値として読めるときだけ 3 桁区切りにする（入力途中の "1." や "-" はそのまま）。 */
export function groupDigits(raw: string): string {
  if (!/^-?\d+(\.\d+)?$/.test(raw)) {
    return raw;
  }
  const [int = "", frac] = raw.split(".");
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return frac === undefined ? grouped : `${grouped}.${frac}`;
}

/**
 * フォーカス時に表示を切り替えると選択範囲が外れ、打った数字が既存の値に追記されてしまう。
 * 再描画のあとで全選択し直し、タップや Tab で入ってそのまま打てば置き換わるようにする。
 */
export function selectAllAfterRender(el: HTMLInputElement) {
  requestAnimationFrame(() => {
    if (document.activeElement === el) {
      el.select();
    }
  });
}

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type"> & {
  value: string;
  onValueChange: (raw: string) => void;
};

/**
 * 金額・数量の入力欄。フォーカス中は素の数字、離れると 3 桁区切りで表示する。
 * 値（value / onValueChange）は常にカンマなしの半角文字列。
 */
export function AmountInput({ value, onValueChange, onFocus, onBlur, ...rest }: Props) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      {...rest}
      type="text"
      inputMode="decimal"
      autoComplete="off"
      value={focused ? value : groupDigits(value)}
      onChange={(e) => onValueChange(normalizeNumeric(e.target.value))}
      onFocus={(e) => {
        setFocused(true);
        selectAllAfterRender(e.currentTarget);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        onBlur?.(e);
      }}
    />
  );
}
