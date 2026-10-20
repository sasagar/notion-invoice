import { describe, expect, test } from "vitest";
import {
  filterInvoiceItems,
  hasListFilter,
  isOverdue,
  parseListQuery,
  summarizeInvoiceItems,
  toListQuery,
} from "@/lib/invoice-list";
import type { InvoiceListItem } from "@/lib/notion/fetchers";

function item(
  id: string,
  over: Partial<InvoiceListItem["meta"]> & { amount?: number | null; customerName?: string },
): InvoiceListItem {
  const { amount = 10000, customerName = "", ...meta } = over;
  return {
    meta: {
      id,
      title: `${id} 件名`,
      status: "ドラフト",
      publishedAt: null,
      dueTo: null,
      taxIncluded: false,
      withholdingExempt: false,
      rounding: "round",
      note: "",
      createdAt: "",
      updatedAt: "",
      customerRelationId: null,
      accountRelationId: null,
      itemRelationIds: [],
      ...meta,
    },
    customerName,
    totalAmount: amount,
    editorId: id,
  };
}

const TODAY = "2026-10-20";

describe("isOverdue", () => {
  test("入金待ちで期限が今日より前なら超過、今日ちょうどは超過ではない", () => {
    expect(isOverdue(item("a", { status: "請求書送付済み", dueTo: "2026-10-19" }), TODAY)).toBe(
      true,
    );
    expect(isOverdue(item("b", { status: "請求書送付済み", dueTo: "2026-10-20" }), TODAY)).toBe(
      false,
    );
  });

  test("入金待ち以外・期限なしは超過にしない", () => {
    expect(isOverdue(item("a", { status: "支払い済み", dueTo: "2026-01-01" }), TODAY)).toBe(false);
    expect(isOverdue(item("b", { status: "請求書送付済み", dueTo: null }), TODAY)).toBe(false);
  });
});

describe("filterInvoiceItems", () => {
  const items = [
    item("A001", {
      status: "請求書送付済み",
      dueTo: "2026-10-01",
      customerRelationId: "c1",
      customerName: "株式会社ブルー",
    }),
    item("A002", { status: "支払い済み", customerRelationId: "c2", customerName: "グリーン工房" }),
    item("B003", { status: "請求書送付済み", dueTo: "2026-10-31", customerRelationId: "c1" }),
  ];

  test("条件なしは全件", () => {
    expect(filterInvoiceItems(items, {}, TODAY)).toHaveLength(3);
  });

  test("ステータス・顧客・期限超過で絞る", () => {
    expect(
      filterInvoiceItems(items, { status: "請求書送付済み" }, TODAY).map((x) => x.meta.id),
    ).toEqual(["A001", "B003"]);
    expect(filterInvoiceItems(items, { customerId: "c2" }, TODAY).map((x) => x.meta.id)).toEqual([
      "A002",
    ]);
    expect(filterInvoiceItems(items, { overdue: true }, TODAY).map((x) => x.meta.id)).toEqual([
      "A001",
    ]);
  });

  test("キーワードは番号・件名・顧客名を大文字小文字を区別せず部分一致", () => {
    expect(filterInvoiceItems(items, { q: "b003" }, TODAY).map((x) => x.meta.id)).toEqual(["B003"]);
    expect(filterInvoiceItems(items, { q: "グリーン" }, TODAY).map((x) => x.meta.id)).toEqual([
      "A002",
    ]);
  });
});

describe("summarizeInvoiceItems", () => {
  test("入金待ち・期限超過・今月発行を集計する（金額不明は 0 扱い）", () => {
    const s = summarizeInvoiceItems(
      [
        item("1", {
          status: "請求書送付済み",
          dueTo: "2026-10-01",
          publishedAt: "2026-09-25",
          amount: 1000,
        }),
        item("2", {
          status: "請求書送付済み",
          dueTo: "2026-11-30",
          publishedAt: "2026-10-05",
          amount: 2000,
        }),
        item("3", { status: "支払い済み", publishedAt: "2026-10-10", amount: 4000 }),
        item("4", { status: "ドラフト", publishedAt: "2026-10-12", amount: 8000 }),
        item("5", { status: "請求書送付済み", dueTo: "2026-09-30", amount: null }),
      ],
      TODAY,
    );
    expect(s.awaiting).toEqual({ count: 3, amount: 3000 });
    expect(s.overdue).toEqual({ count: 2, amount: 1000 });
    expect(s.issuedThisMonth).toEqual({ count: 2, amount: 6000 });
  });
});

describe("parseListQuery / toListQuery", () => {
  test("往復で同じ条件に戻る", () => {
    const f = { status: "支払い済み", customerId: "c1", q: "保守", overdue: true };
    expect(parseListQuery(toListQuery(f))).toEqual(f);
  });

  test("未知のステータスや空の値は無視する", () => {
    expect(parseListQuery("?status=bogus&q=%20&overdue=0")).toEqual({});
    expect(toListQuery({})).toBe("");
    expect(hasListFilter({})).toBe(false);
  });
});
