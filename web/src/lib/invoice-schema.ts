/**
 * 請求書エディタのフォーム検証スキーマ（zod）。クライアント/サーバで共有する。
 * 出力型は repository の InvoiceEditorInput に一致し、そのまま create/update に渡せる。
 */
import { z } from "zod";

/** ステータス選択肢（順序は UI の select と一致）。 */
export const INVOICE_STATUSES = [
  "ドラフト",
  "見積送付済み",
  "請求書送付済み",
  "支払い済み",
  "キャンセル",
] as const;

/** 税率選択肢。 */
export const TAX_RATES = ["10%", "8%", "非課税"] as const;

/** 行金額の丸め方式（DB/計算は英語トークン、表示は日本語ラベル）。 */
export const ROUNDING_MODES = ["round", "floor", "ceil"] as const;
export const ROUNDING_LABELS: Record<(typeof ROUNDING_MODES)[number], string> = {
  round: "四捨五入",
  floor: "切り捨て",
  ceil: "切り上げ",
};

/** 単位の候補（自由入力も可のため UI では datalist として使う）。 */
export const UNITS = ["時間", "件", "式", "回", "日", "人"] as const;

// 空文字/未指定を null に正規化する（date / relation id 共通）。
const nullableString = z.preprocess(
  (v) => (typeof v === "string" && v.trim() !== "" ? v.trim() : null),
  z.string().nullable(),
);

/** 明細行スキーマ。unitPrice/quantity は数値文字列も coerce。 */
export const invoiceRowSchema = z.object({
  name: z.string().default(""),
  itemNames: z.array(z.string()).default([]),
  unitPrice: z.coerce.number({ error: "単価は数値で入力してください" }),
  quantity: z.coerce.number({ error: "数量は数値で入力してください" }),
  unit: z.string().default(""),
  taxRate: z.enum(TAX_RATES),
  itemIds: z.array(z.string()).default([]),
});

/** 請求書スキーマ。 */
export const invoiceSchema = z.object({
  invoiceNumber: z.string().trim().min(1, "請求書番号は必須です"),
  title: z.string().default(""),
  status: z.enum(INVOICE_STATUSES),
  customerId: nullableString,
  accountId: nullableString,
  publishedAt: nullableString,
  dueTo: nullableString,
  taxIncluded: z.boolean().default(false),
  withholdingExempt: z.boolean().default(false),
  rounding: z.enum(ROUNDING_MODES).default("round"),
  note: z.string().default(""),
  memo: z.string().default(""),
  rows: z.array(invoiceRowSchema).default([]),
});

export type InvoiceFormValues = z.infer<typeof invoiceSchema>;

/** safeParse の結果から先頭のエラーメッセージを取り出す。 */
export function firstInvoiceIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? "入力が不正です";
}
