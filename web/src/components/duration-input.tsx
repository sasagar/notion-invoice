"use client";

import { type InputHTMLAttributes, useState } from "react";
import { normalizeNumeric, selectAllAfterRender } from "@/components/amount-input";
import { parseHoursMinutes, toHoursMinutesInput } from "@/lib/duration";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type"> & {
  /** 時間の小数（"1.5"）。保存・計算はこの値で行う。 */
  value: string;
  onValueChange: (hours: string) => void;
};

/** 小数の時間を「1:30」で表示する。数値にならない値（入力途中の誤り）はそのまま見せる。 */
function display(value: string): string {
  const n = Number(value);
  return value === "" || !Number.isFinite(n) ? value : toHoursMinutesInput(n);
}

/**
 * 単位「時間」の数量入力。「1:30」のように時:分で入力でき、値は時間の小数で親へ返す。
 * 「1.5」のような小数もそのまま受け付ける。形式に合わない入力は文字列のまま返し、
 * 保存時の検証（invoiceSchema）でエラーにする。
 */
export function DurationInput({ value, onValueChange, onFocus, onBlur, ...rest }: Props) {
  // 編集中だけ入力文字列を持つ（null = 値から表示を組み立てる）。
  const [text, setText] = useState<string | null>(null);
  return (
    <input
      {...rest}
      type="text"
      inputMode="text"
      autoComplete="off"
      placeholder="1:30"
      value={text ?? display(value)}
      onChange={(e) => {
        const raw = e.target.value;
        setText(raw);
        const hours = parseHoursMinutes(raw);
        onValueChange(hours === null ? normalizeNumeric(raw) : String(hours));
      }}
      onFocus={(e) => {
        setText(display(value));
        selectAllAfterRender(e.currentTarget);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setText(null);
        onBlur?.(e);
      }}
    />
  );
}
