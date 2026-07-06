import Database from "better-sqlite3";
import { beforeEach, describe, expect, test } from "vitest";
import {
  createInvoice,
  deleteInvoice,
  getInvoiceEditorById,
  getInvoiceEditorByNumber,
  getFullInvoiceByNumber,
  type InvoiceEditorInput,
  isDuplicateNumberError,
  nextCopyNumber,
  saveInvoice,
  updateInvoiceById,
  upsertItem,
} from "@/lib/repository";
import { applyAppSchema } from "@/lib/schema";

const OWNER = "u1";
const OTHER = "u2";

function makeDb(): Database.Database {
  const db = new Database(":memory:");
  db.pragma("foreign_keys = ON");
  db.exec("CREATE TABLE user (id TEXT PRIMARY KEY)");
  applyAppSchema(db);
  db.prepare("INSERT INTO user (id) VALUES (?)").run(OWNER);
  db.prepare("INSERT INTO user (id) VALUES (?)").run(OTHER);
  return db;
}

function editorInput(overrides: Partial<InvoiceEditorInput> = {}): InvoiceEditorInput {
  return {
    invoiceNumber: "INV-1",
    title: "件名",
    status: "ドラフト",
    customerId: null,
    accountId: null,
    publishedAt: "2026-01-01",
    dueTo: null,
    taxIncluded: false,
    withholdingExempt: true,
    note: "備考",
    memo: "内部メモ",
    rows: [
      {
        name: "設計",
        itemNames: ["設計"],
        unitPrice: 8000,
        quantity: 2,
        unit: "時間",
        taxRate: "10%",
        itemIds: [],
      },
    ],
    ...overrides,
  };
}

describe("repository 請求書エディタ（create/update/delete/getEditor）", () => {
  let db: Database.Database;
  beforeEach(() => {
    db = makeDb();
  });

  test("createInvoice → getInvoiceEditorById が memo・行の itemIds 込みで復元", () => {
    const itemId = upsertItem(db, OWNER, { notionPageId: null, name: "設計", unitPrice: 8000 });
    const id = createInvoice(
      db,
      OWNER,
      editorInput({
        rows: [
          {
            name: "設計作業",
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
    const data = getInvoiceEditorById(db, OWNER, id);
    expect(data).not.toBeNull();
    expect(data?.invoiceNumber).toBe("INV-1");
    expect(data?.memo).toBe("内部メモ");
    expect(data?.note).toBe("備考");
    expect(data?.rows).toHaveLength(1);
    expect(data?.rows[0]?.name).toBe("設計作業");
    expect(data?.rows[0]?.itemNames).toEqual(["設計"]);
    expect(data?.rows[0]?.itemIds).toEqual([itemId]);
    // 番号で引いても同じ
    expect(getInvoiceEditorByNumber(db, OWNER, "INV-1")?.id).toBe(id);
    // 他 owner からは見えない
    expect(getInvoiceEditorById(db, OTHER, id)).toBeNull();
  });

  test("createInvoice の番号重複は UNIQUE 違反（isDuplicateNumberError=true）", () => {
    createInvoice(db, OWNER, editorInput({ invoiceNumber: "DUP" }));
    try {
      createInvoice(db, OWNER, editorInput({ invoiceNumber: "DUP", title: "別" }));
      throw new Error("should have thrown");
    } catch (e) {
      expect(isDuplicateNumberError(e)).toBe(true);
    }
    // 別 owner なら同じ番号でも作成できる
    expect(() => createInvoice(db, OTHER, editorInput({ invoiceNumber: "DUP" }))).not.toThrow();
  });

  test("updateInvoiceById は番号変更・行差し替え可、未知idはfalse", () => {
    const id = createInvoice(db, OWNER, editorInput({ invoiceNumber: "OLD" }));
    const ok = updateInvoiceById(
      db,
      OWNER,
      id,
      editorInput({
        invoiceNumber: "NEW",
        title: "更新後",
        status: "支払い済み",
        rows: [
          {
            name: "値引き",
            itemNames: [],
            unitPrice: -1000,
            quantity: 1,
            unit: "式",
            taxRate: "10%",
            itemIds: [],
          },
        ],
      }),
    );
    expect(ok).toBe(true);
    const data = getInvoiceEditorByNumber(db, OWNER, "NEW");
    expect(data?.title).toBe("更新後");
    expect(data?.status).toBe("支払い済み");
    expect(data?.rows).toHaveLength(1);
    expect(data?.rows[0]?.unitPrice).toBe(-1000);
    // 旧番号では引けない
    expect(getInvoiceEditorByNumber(db, OWNER, "OLD")).toBeNull();
    // 未知 id は false
    expect(updateInvoiceById(db, OWNER, "no-such-id", editorInput())).toBe(false);
    // 他 owner では更新できない
    expect(updateInvoiceById(db, OTHER, id, editorInput({ invoiceNumber: "X" }))).toBe(false);
  });

  test("updateInvoiceById で他行と番号衝突は UNIQUE 違反", () => {
    createInvoice(db, OWNER, editorInput({ invoiceNumber: "A" }));
    const idB = createInvoice(db, OWNER, editorInput({ invoiceNumber: "B" }));
    try {
      updateInvoiceById(db, OWNER, idB, editorInput({ invoiceNumber: "A" }));
      throw new Error("should have thrown");
    } catch (e) {
      expect(isDuplicateNumberError(e)).toBe(true);
    }
  });

  test("updateInvoiceById は notion_page_id を変更しない（import連携を保持）", () => {
    // import 由来の請求書を saveInvoice で作る（notion_page_id あり）
    saveInvoice(db, OWNER, {
      notionPageId: "page-X",
      invoiceNumber: "IMP",
      title: "取込",
      status: "ドラフト",
      customerId: null,
      accountId: null,
      publishedAt: null,
      dueTo: null,
      taxIncluded: false,
      withholdingExempt: true,
      note: "",
      memo: "",
      rows: [],
    });
    const id = getInvoiceEditorByNumber(db, OWNER, "IMP")?.id ?? "";
    updateInvoiceById(db, OWNER, id, editorInput({ invoiceNumber: "IMP", title: "手編集" }));
    const row = db.prepare("SELECT notion_page_id FROM invoices WHERE id = ?").get(id) as {
      notion_page_id: string | null;
    };
    expect(row.notion_page_id).toBe("page-X");
  });

  test("deleteInvoice は行ごと削除（CASCADE）", () => {
    const id = createInvoice(db, OWNER, editorInput({ invoiceNumber: "DEL" }));
    expect(getFullInvoiceByNumber(db, OWNER, "DEL")).not.toBeNull();
    expect(deleteInvoice(db, OTHER, id)).toBe(false);
    expect(deleteInvoice(db, OWNER, id)).toBe(true);
    expect(getInvoiceEditorById(db, OWNER, id)).toBeNull();
    const rowCount = db
      .prepare("SELECT COUNT(*) AS n FROM invoice_rows WHERE invoice_id = ?")
      .get(id) as { n: number };
    expect(rowCount.n).toBe(0);
    expect(deleteInvoice(db, OWNER, id)).toBe(false);
  });

  test("nextCopyNumber は再複製でも衝突しない（-copy, -copy2, -copy3…）", () => {
    createInvoice(db, OWNER, editorInput({ invoiceNumber: "X" }));
    expect(nextCopyNumber(db, OWNER, "X")).toBe("X-copy");
    createInvoice(db, OWNER, editorInput({ invoiceNumber: "X-copy" }));
    expect(nextCopyNumber(db, OWNER, "X")).toBe("X-copy2");
    createInvoice(db, OWNER, editorInput({ invoiceNumber: "X-copy2" }));
    expect(nextCopyNumber(db, OWNER, "X")).toBe("X-copy3");
    // owner が違えば -copy から
    expect(nextCopyNumber(db, OTHER, "X")).toBe("X-copy");
  });
});
