/**
 * マスタCRUD（顧客/自社/項目）のリクエストボディ検証スキーマ（zod）。
 * ルートは safeParse し、失敗時は先頭の issue メッセージを 400 で返す。
 * 出力型は repository の *Fields 型に一致する。
 */
import { z } from "zod";

/** 顧客: 顧客名か社名のどちらか必須。 */
export const customerSchema = z
  .object({
    name: z.string().trim().default(""),
    companyName: z.string().trim().default(""),
    honorific: z.string().trim().default(""),
    companyInfo: z.string().trim().default(""),
    contactName: z.string().trim().default(""),
  })
  .refine((v) => v.name !== "" || v.companyName !== "", {
    error: "顧客名または社名は必須です",
  });

/** 項目: 項目名必須・単価は数値（文字列も coerce）。 */
export const itemSchema = z.object({
  name: z.string().trim().min(1, "項目名は必須です"),
  unitPrice: z.coerce.number({ error: "単価は数値で入力してください" }),
});

/** 自社: 会社名必須。sealFileId は空文字/未指定を null に正規化する。 */
export const accountSchema = z.object({
  slug: z.string().trim().default(""),
  companyName: z.string().trim().min(1, "会社名は必須です"),
  contactName: z.string().trim().default(""),
  companyInfo: z.string().trim().default(""),
  bankInfo: z.string().trim().default(""),
  registrationNumber: z.string().trim().default(""),
  sealFileId: z.preprocess(
    (v) => (typeof v === "string" && v.trim() !== "" ? v.trim() : null),
    z.string().nullable(),
  ),
});

/** safeParse の結果から先頭のエラーメッセージを取り出す。 */
export function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? "入力が不正です";
}
