import Database from "better-sqlite3";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { type InvoiceListPage, isSqliteBackend } from "@/lib/data/backend";
import {
  getFullInvoiceByNumber,
  type InvoiceInput,
  listInvoiceItemsPage,
  saveInvoice,
  upsertCustomer,
} from "@/lib/repository";
import { applyAppSchema } from "@/lib/schema";

const OWNER = "u1";

/** インメモリ DB を用意（repository.test.ts と同じ最小構成）。 */
function makeDb(): Database.Database {
  const db = new Database(":memory:");
  db.pragma("foreign_keys = ON");
  db.exec("CREATE TABLE user (id TEXT PRIMARY KEY)");
  applyAppSchema(db);
  db.prepare("INSERT INTO user (id) VALUES (?)").run(OWNER);
  return db;
}

/** テスト用の請求書入力（外税10%・源泉なし → invoiceSum=11000）。 */
function sampleInvoice(overrides: Partial<InvoiceInput> = {}): InvoiceInput {
  return {
    notionPageId: null,
    invoiceNumber: "INV-1",
    title: "件名",
    status: "ドラフト",
    customerId: null,
    accountId: null,
    publishedAt: "2026-01-01",
    dueTo: null,
    taxIncluded: false,
    withholdingExempt: true,
    note: "",
    memo: "",
    rows: [
      { name: "作業", itemNames: [], unitPrice: 10000, quantity: 1, unit: "式", taxRate: "10%" },
    ],
    ...overrides,
  };
}

describe("data/backend（DATA_BACKEND による読み取り切替）", () => {
  describe("isSqliteBackend（環境変数による分岐）", () => {
    const original = process.env.DATA_BACKEND;
    afterEach(() => {
      if (original === undefined) {
        delete process.env.DATA_BACKEND;
      } else {
        process.env.DATA_BACKEND = original;
      }
    });

    test("DATA_BACKEND=sqlite のとき true", () => {
      process.env.DATA_BACKEND = "sqlite";
      expect(isSqliteBackend()).toBe(true);
    });

    test("未設定なら false（既定は notion）", () => {
      delete process.env.DATA_BACKEND;
      expect(isSqliteBackend()).toBe(false);
    });

    test('"notion" など他の値は false', () => {
      process.env.DATA_BACKEND = "notion";
      expect(isSqliteBackend()).toBe(false);
    });
  });

  // sqlite バックエンドは repository をそのまま返すため、委譲先を :memory: で検証する
  // （notion 側は資格情報が無いためここではスキップ）。
  describe("sqlite パスの委譲先（repository）を :memory: で検証", () => {
    let db: Database.Database;
    beforeEach(() => {
      db = makeDb();
    });

    test("一覧は InvoiceListPage（items + total）を返す", () => {
      const customerId = upsertCustomer(db, OWNER, {
        notionPageId: null,
        name: "顧客",
        companyName: "顧客社",
        honorific: "御中",
        companyInfo: "",
        contactName: "",
      });
      saveInvoice(db, OWNER, sampleInvoice({ invoiceNumber: "INV-1", customerId }));

      const page: InvoiceListPage = listInvoiceItemsPage(db, OWNER, 1, 10);
      expect(page.total).toBe(1);
      expect(page.items).toHaveLength(1);
      expect(page.items[0]?.meta.id).toBe("INV-1");
      expect(page.items[0]?.customerName).toBe("顧客社");
      expect(page.items[0]?.totalAmount).toBe(11000);
    });

    test("詳細は FullInvoice を返す（無ければ null）", () => {
      saveInvoice(db, OWNER, sampleInvoice({ invoiceNumber: "INV-2" }));

      const full = getFullInvoiceByNumber(db, OWNER, "INV-2");
      expect(full).not.toBeNull();
      expect(full?.invoice.meta.id).toBe("INV-2");
      expect(full?.invoice.totals.invoiceSum).toBe(11000);
      expect(getFullInvoiceByNumber(db, OWNER, "無い番号")).toBeNull();
    });
  });
});
