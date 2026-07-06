import Database from "better-sqlite3";
import { beforeEach, describe, expect, test } from "vitest";
import {
  getAccount,
  getFullInvoiceByNumber,
  type InvoiceInput,
  insertFile,
  listInvoiceItemsPage,
  listInvoiceMetas,
  saveInvoice,
  upsertAccount,
  upsertCustomer,
  upsertItem,
} from "@/lib/repository";
import { applyAppSchema } from "@/lib/schema";

const OWNER = "u1";

/** インメモリ DB を用意（本番同様 FK を有効化し、最小の user 表を先に作る）。 */
function makeDb(): Database.Database {
  const db = new Database(":memory:");
  db.pragma("foreign_keys = ON");
  db.exec("CREATE TABLE user (id TEXT PRIMARY KEY)");
  applyAppSchema(db);
  db.prepare("INSERT INTO user (id) VALUES (?)").run(OWNER);
  return db;
}

/** テスト用の請求書入力を組み立てる（必要な項目だけ上書き）。 */
function invoiceInput(overrides: Partial<InvoiceInput> = {}): InvoiceInput {
  return {
    notionPageId: null,
    invoiceNumber: "INV-001",
    title: "テスト請求書",
    status: "ドラフト",
    customerId: null,
    accountId: null,
    publishedAt: "2026-01-01",
    dueTo: "2026-01-31",
    taxIncluded: false,
    withholdingExempt: true,
    note: "",
    memo: "",
    rows: [
      {
        name: "作業",
        itemNames: ["設計"],
        unitPrice: 10000,
        quantity: 1,
        unit: "式",
        taxRate: "10%",
      },
    ],
    ...overrides,
  };
}

describe("repository（SQLite 読み書き）", () => {
  let db: Database.Database;

  beforeEach(() => {
    db = makeDb();
  });

  test("saveInvoice → getFullInvoiceByNumber の往復（明細・合計・関連を復元）", () => {
    const customerId = upsertCustomer(db, OWNER, {
      notionPageId: null,
      name: "得意先太郎",
      companyName: "得意先株式会社",
      honorific: "御中",
      companyInfo: "東京都...",
      contactName: "担当花子",
    });
    const accountId = upsertAccount(db, OWNER, {
      notionPageId: null,
      slug: "self",
      companyName: "自社合同会社",
      contactName: "自社担当",
      companyInfo: "大阪府...",
      bankInfo: "○○銀行...",
      registrationNumber: "T1234567890123",
      sealFileId: null,
    });

    saveInvoice(
      db,
      OWNER,
      invoiceInput({
        invoiceNumber: "INV-100",
        customerId,
        accountId,
        rows: [
          {
            name: "設計",
            itemNames: ["設計"],
            unitPrice: 8000,
            quantity: 12.5,
            unit: "時間",
            taxRate: "10%",
          },
          {
            name: "値引き",
            itemNames: [],
            unitPrice: -1000,
            quantity: 1,
            unit: "式",
            taxRate: "10%",
          },
          {
            name: "郵送",
            itemNames: [],
            unitPrice: 500,
            quantity: 1,
            unit: "件",
            taxRate: "非課税",
          },
        ],
      }),
    );

    const full = getFullInvoiceByNumber(db, OWNER, "INV-100");
    expect(full).not.toBeNull();
    if (full === null) {
      return;
    }
    // メタ
    expect(full.invoice.meta.id).toBe("INV-100");
    expect(full.invoice.meta.itemRelationIds).toHaveLength(3);
    // 明細（順序・スナップショット・導出金額）
    expect(full.invoice.rows.map((r) => r.name)).toEqual(["設計", "値引き", "郵送"]);
    expect(full.invoice.rows[0]?.amounts).toEqual({
      amount10: 100000,
      amount8: 0,
      amount0: 0,
      subtotal: 100000,
    });
    // 合計（sum10=100000-1000=99000, sum0=500, tax10=9900, 源泉なし）
    expect(full.invoice.totals.sum10).toBe(99000);
    expect(full.invoice.totals.sum0).toBe(500);
    expect(full.invoice.totals.tax10).toBe(9900);
    expect(full.invoice.totals.invoiceSum).toBe(99000 + 500 + 9900);
    // 関連
    expect(full.customer?.companyName).toBe("得意先株式会社");
    expect(full.account?.companyName).toBe("自社合同会社");
  });

  test("存在しない番号は null", () => {
    expect(getFullInvoiceByNumber(db, OWNER, "無い番号")).toBeNull();
  });

  test("listInvoiceItemsPage のページング・合計金額・顧客名", () => {
    const customerId = upsertCustomer(db, OWNER, {
      notionPageId: null,
      name: "顧客名のみ",
      companyName: "",
      honorific: "御中",
      companyInfo: "",
      contactName: "",
    });
    // 発行日昇順で 3 件（一覧は降順で返る想定）。
    for (const [i, pub] of ["2026-01-01", "2026-02-01", "2026-03-01"].entries()) {
      saveInvoice(
        db,
        OWNER,
        invoiceInput({
          invoiceNumber: `INV-${i}`,
          publishedAt: pub,
          customerId,
          rows: [
            {
              name: "作業",
              itemNames: [],
              unitPrice: 10000,
              quantity: 1,
              unit: "式",
              taxRate: "10%",
            },
          ],
        }),
      );
    }

    const page1 = listInvoiceItemsPage(db, OWNER, 1, 2);
    expect(page1.total).toBe(3);
    expect(page1.items).toHaveLength(2);
    // 発行日降順: INV-2(3月) → INV-1(2月)
    expect(page1.items.map((x) => x.meta.id)).toEqual(["INV-2", "INV-1"]);
    // 外税10%・源泉なし: invoiceSum = 11000。companyName 空なら name にフォールバック。
    expect(page1.items[0]?.totalAmount).toBe(11000);
    expect(page1.items[0]?.customerName).toBe("顧客名のみ");

    const page2 = listInvoiceItemsPage(db, OWNER, 2, 2);
    expect(page2.items).toHaveLength(1);
    expect(page2.items[0]?.meta.id).toBe("INV-0");

    // listInvoiceMetas も同じ並び。
    expect(listInvoiceMetas(db, OWNER).map((m) => m.id)).toEqual(["INV-2", "INV-1", "INV-0"]);
  });

  test("notion_page_id upsert の冪等性（重複作成しない・最新で上書き）", () => {
    const first = saveInvoice(
      db,
      OWNER,
      invoiceInput({ notionPageId: "page-A", invoiceNumber: "INV-IDEM", title: "旧タイトル" }),
    );
    const second = saveInvoice(
      db,
      OWNER,
      invoiceInput({ notionPageId: "page-A", invoiceNumber: "INV-IDEM", title: "新タイトル" }),
    );
    expect(second).toBe(first); // 同一行を更新

    const count = db
      .prepare("SELECT COUNT(*) AS n FROM invoices WHERE owner_id = ? AND invoice_number = ?")
      .get(OWNER, "INV-IDEM") as { n: number };
    expect(count.n).toBe(1);

    const full = getFullInvoiceByNumber(db, OWNER, "INV-IDEM");
    expect(full?.invoice.meta.title).toBe("新タイトル");

    // customers/items の upsert も冪等（同 notion_page_id で id 不変）。
    const c1 = upsertCustomer(db, OWNER, {
      notionPageId: "cust-A",
      name: "A",
      companyName: "旧社名",
      honorific: "",
      companyInfo: "",
      contactName: "",
    });
    const c2 = upsertCustomer(db, OWNER, {
      notionPageId: "cust-A",
      name: "A",
      companyName: "新社名",
      honorific: "",
      companyInfo: "",
      contactName: "",
    });
    expect(c2).toBe(c1);
  });

  test("重複 invoice_number は updated_at 最新（最後の保存内容）を採用", () => {
    saveInvoice(
      db,
      OWNER,
      invoiceInput({ notionPageId: "page-old", invoiceNumber: "INV-DUP", title: "旧" }),
    );
    // 別 notion ページだが同じ番号 → 番号一意制約により同一論理行として上書き。
    saveInvoice(
      db,
      OWNER,
      invoiceInput({ notionPageId: "page-new", invoiceNumber: "INV-DUP", title: "新" }),
    );

    const count = db
      .prepare("SELECT COUNT(*) AS n FROM invoices WHERE owner_id = ? AND invoice_number = ?")
      .get(OWNER, "INV-DUP") as { n: number };
    expect(count.n).toBe(1);

    const full = getFullInvoiceByNumber(db, OWNER, "INV-DUP");
    expect(full?.invoice.meta.title).toBe("新");
  });

  test("印影ファイルを保存すると Account.sealImageUrl が data URI を返す", () => {
    const data = Buffer.from([1, 2, 3]);
    const fileId = insertFile(db, OWNER, {
      mimeType: "image/png",
      byteSize: data.length,
      data,
    });
    const accountId = upsertAccount(db, OWNER, {
      notionPageId: null,
      slug: "self",
      companyName: "自社",
      contactName: "担当",
      companyInfo: "",
      bankInfo: "",
      registrationNumber: "",
      sealFileId: fileId,
    });
    const account = getAccount(db, OWNER, accountId);
    // <img> と @react-pdf の <Image> の両方が表示できる data URI（配信ルートは Phase 2）。
    expect(account?.sealImageUrl).toBe(`data:image/png;base64,${data.toString("base64")}`);
  });

  test("upsertItem は id を返し listInvoiceItemsPage の行由来に使える", () => {
    const itemId = upsertItem(db, OWNER, { notionPageId: "item-A", name: "設計", unitPrice: 8000 });
    saveInvoice(
      db,
      OWNER,
      invoiceInput({
        invoiceNumber: "INV-ITEM",
        rows: [
          {
            name: "設計",
            itemNames: ["設計"],
            unitPrice: 8000,
            quantity: 2,
            unit: "時間",
            taxRate: "10%",
            itemIds: [itemId],
          },
        ],
      }),
    );
    const link = db
      .prepare("SELECT COUNT(*) AS n FROM invoice_row_items WHERE item_id = ?")
      .get(itemId) as { n: number };
    expect(link.n).toBe(1);
  });
});
