/**
 * ブランドパレット（単一ソース）。
 * CSS の @theme（Tailwind）と PDF(@react-pdf) の色定義はこの値に揃える。
 */
export const kentBlue = {
  50: "#f0f6fa",
  100: "#dce8f2",
  200: "#afc7e0",
  300: "#85a2cc",
  400: "#425fa8",
  500: "#112382",
  600: "#0e1f75",
  700: "#0a1761",
  800: "#06104f",
  900: "#040a3b",
  950: "#020526",
} as const;

/** ロゴのゴールドアクセント。 */
export const brandGold = "#ffc000";

/**
 * 朱色（検収印のインク色）。Web UI のみで使用する新規アクセント。
 * 「捺印された」＝確定・完了を示す唯一の用途に絞って使う。
 */
export const shuiro = {
  50: "#fdf1ef",
  300: "#e2917f",
  400: "#d46952",
  500: "#c1392b",
  600: "#a32e22",
  700: "#7f2519",
} as const;

/** 台帳紙の背景トーン（暖色クリームではなく寒色寄りの紙色）。 */
export const paper = {
  DEFAULT: "#f3f5f4",
  line: "#d7dce1",
} as const;
