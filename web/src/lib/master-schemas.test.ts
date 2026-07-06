import { describe, expect, test } from "vitest";
import { accountSchema, customerSchema, itemSchema } from "@/lib/master-schemas";

describe("customerSchema", () => {
  test("顧客名・社名が両方空なら不可", () => {
    expect(customerSchema.safeParse({ name: "", companyName: "" }).success).toBe(false);
  });
  test("社名のみで可・前後空白を除去", () => {
    const r = customerSchema.safeParse({ companyName: "  A社  ", contactName: " 田中 " });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data).toEqual({
        name: "",
        companyName: "A社",
        honorific: "",
        companyInfo: "",
        contactName: "田中",
      });
    }
  });
});

describe("itemSchema", () => {
  test("項目名が空なら不可", () => {
    expect(itemSchema.safeParse({ name: "", unitPrice: 100 }).success).toBe(false);
  });
  test("単価が数値でなければ不可", () => {
    expect(itemSchema.safeParse({ name: "設計", unitPrice: "abc" }).success).toBe(false);
  });
  test("数値文字列を coerce する", () => {
    const r = itemSchema.safeParse({ name: "設計", unitPrice: "8000" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data).toEqual({ name: "設計", unitPrice: 8000 });
    }
  });
});

describe("accountSchema", () => {
  test("会社名が空なら不可", () => {
    expect(accountSchema.safeParse({ companyName: "" }).success).toBe(false);
  });
  test("sealFileId 未指定/空は null に正規化", () => {
    const r = accountSchema.safeParse({ companyName: "自社" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.sealFileId).toBeNull();
    }
    const r2 = accountSchema.safeParse({ companyName: "自社", sealFileId: "" });
    expect(r2.success && r2.data.sealFileId).toBeNull();
  });
  test("sealFileId 文字列は trim して保持", () => {
    const r = accountSchema.safeParse({ companyName: "自社", sealFileId: " f1 " });
    expect(r.success && r.data.sealFileId).toBe("f1");
  });
});
