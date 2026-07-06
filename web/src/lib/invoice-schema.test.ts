import { describe, expect, test } from "vitest";
import { invoiceSchema } from "@/lib/invoice-schema";

const base = {
  invoiceNumber: "INV-1",
  status: "ドラフト",
  taxIncluded: false,
  withholdingExempt: false,
  rows: [],
};

describe("invoiceSchema", () => {
  test("請求書番号が空なら不可", () => {
    expect(invoiceSchema.safeParse({ ...base, invoiceNumber: "" }).success).toBe(false);
  });
  test("未知のステータスは不可", () => {
    expect(invoiceSchema.safeParse({ ...base, status: "なにか" }).success).toBe(false);
  });
  test("行の税率が不正なら不可", () => {
    const r = invoiceSchema.safeParse({
      ...base,
      rows: [{ name: "x", unitPrice: 1, quantity: 1, unit: "式", taxRate: "5%" }],
    });
    expect(r.success).toBe(false);
  });
  test("空の date / relation は null に正規化、rows 既定は空配列", () => {
    const r = invoiceSchema.safeParse({
      ...base,
      publishedAt: "",
      dueTo: "  ",
      customerId: "",
      accountId: null,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.publishedAt).toBeNull();
      expect(r.data.dueTo).toBeNull();
      expect(r.data.customerId).toBeNull();
      expect(r.data.accountId).toBeNull();
      expect(r.data.rows).toEqual([]);
      expect(r.data.title).toBe("");
    }
  });
  test("行の単価・数量は数値文字列を coerce", () => {
    const r = invoiceSchema.safeParse({
      ...base,
      rows: [
        {
          name: "設計",
          itemNames: ["設計"],
          unitPrice: "8000",
          quantity: "2",
          unit: "時間",
          taxRate: "10%",
          itemIds: ["i1"],
        },
      ],
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.rows[0]?.unitPrice).toBe(8000);
      expect(r.data.rows[0]?.quantity).toBe(2);
      expect(r.data.rows[0]?.itemIds).toEqual(["i1"]);
    }
  });
});
