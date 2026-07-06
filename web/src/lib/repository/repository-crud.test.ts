import Database from "better-sqlite3";
import { beforeEach, describe, expect, test } from "vitest";
import {
  createAccount,
  createCustomer,
  createItem,
  deleteAccount,
  deleteCustomer,
  deleteFile,
  deleteItem,
  getAccount,
  getCustomer,
  getFileForOwner,
  getFullInvoiceByNumber,
  getItem,
  insertFile,
  type InvoiceInput,
  listCustomers,
  saveInvoice,
  updateAccount,
  updateCustomer,
  updateItem,
} from "@/lib/repository";
import { applyAppSchema } from "@/lib/schema";

const OWNER = "u1";
const OTHER = "u2";

/** インメモリ DB を用意（user を 2 名: owner 分離の検証用）。 */
function makeDb(): Database.Database {
  const db = new Database(":memory:");
  db.pragma("foreign_keys = ON");
  db.exec("CREATE TABLE user (id TEXT PRIMARY KEY)");
  applyAppSchema(db);
  db.prepare("INSERT INTO user (id) VALUES (?)").run(OWNER);
  db.prepare("INSERT INTO user (id) VALUES (?)").run(OTHER);
  return db;
}

const customerFields = {
  name: "顧客A",
  companyName: "A社",
  honorific: "御中",
  companyInfo: "東京",
  contactName: "担当",
};

const accountFields = {
  slug: "self",
  companyName: "自社",
  contactName: "自担当",
  companyInfo: "大阪",
  bankInfo: "○○銀行",
  registrationNumber: "T1",
  sealFileId: null,
};

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

describe("repository 手動CRUD（顧客/自社/項目/ファイル）", () => {
  let db: Database.Database;
  beforeEach(() => {
    db = makeDb();
  });

  test("顧客: create→update→delete と owner 分離", () => {
    const id = createCustomer(db, OWNER, customerFields);
    expect(getCustomer(db, OWNER, id)?.companyName).toBe("A社");

    // 他 owner からは見えない・更新できない。
    expect(getCustomer(db, OTHER, id)).toBeNull();
    expect(updateCustomer(db, OTHER, id, { ...customerFields, companyName: "X" })).toBe(false);

    expect(updateCustomer(db, OWNER, id, { ...customerFields, companyName: "A改" })).toBe(true);
    expect(getCustomer(db, OWNER, id)?.companyName).toBe("A改");

    expect(listCustomers(db, OWNER)).toHaveLength(1);
    expect(deleteCustomer(db, OTHER, id)).toBe(false);
    expect(deleteCustomer(db, OWNER, id)).toBe(true);
    expect(getCustomer(db, OWNER, id)).toBeNull();
    expect(deleteCustomer(db, OWNER, id)).toBe(false);
  });

  test("項目: create→update→delete（単価も更新される）", () => {
    const id = createItem(db, OWNER, { name: "設計", unitPrice: 8000 });
    expect(getItem(db, OWNER, id)?.unitPrice).toBe(8000);
    expect(updateItem(db, OWNER, id, { name: "設計v2", unitPrice: 9000 })).toBe(true);
    const it = getItem(db, OWNER, id);
    expect(it?.name).toBe("設計v2");
    expect(it?.unitPrice).toBe(9000);
    expect(deleteItem(db, OWNER, id)).toBe(true);
    expect(getItem(db, OWNER, id)).toBeNull();
  });

  test("自社: create→update（印影差し替え）→delete", () => {
    const id = createAccount(db, OWNER, accountFields);
    expect(getAccount(db, OWNER, id)?.sealImageUrl).toBeNull();

    const fileId = insertFile(db, OWNER, {
      mimeType: "image/png",
      byteSize: 3,
      data: Buffer.from([1, 2, 3]),
    });
    expect(updateAccount(db, OWNER, id, { ...accountFields, sealFileId: fileId })).toBe(true);
    expect(getAccount(db, OWNER, id)?.sealImageUrl).toBe(
      `data:image/png;base64,${Buffer.from([1, 2, 3]).toString("base64")}`,
    );

    expect(deleteAccount(db, OWNER, id)).toBe(true);
    expect(getAccount(db, OWNER, id)).toBeNull();
  });

  test("ファイル: getFileForOwner の owner スコープと deleteFile→seal_file_id SET NULL", () => {
    const fileId = insertFile(db, OWNER, {
      mimeType: "image/png",
      byteSize: 2,
      data: Buffer.from([9, 9]),
    });
    expect(getFileForOwner(db, OWNER, fileId)?.mimeType).toBe("image/png");
    expect(getFileForOwner(db, OTHER, fileId)).toBeNull();

    const accountId = createAccount(db, OWNER, { ...accountFields, sealFileId: fileId });
    // 他 owner からは削除できない。
    expect(deleteFile(db, OTHER, fileId)).toBe(false);
    expect(deleteFile(db, OWNER, fileId)).toBe(true);
    // FK ON DELETE SET NULL で印影参照が外れる。
    expect(getAccount(db, OWNER, accountId)?.sealImageUrl).toBeNull();
  });

  test("顧客削除で請求書の customer_id が SET NULL される", () => {
    const customerId = createCustomer(db, OWNER, customerFields);
    saveInvoice(db, OWNER, sampleInvoice({ invoiceNumber: "INV-DEL", customerId }));
    expect(getFullInvoiceByNumber(db, OWNER, "INV-DEL")?.customer?.companyName).toBe("A社");

    expect(deleteCustomer(db, OWNER, customerId)).toBe(true);
    const full = getFullInvoiceByNumber(db, OWNER, "INV-DEL");
    expect(full).not.toBeNull();
    expect(full?.customer).toBeNull();
  });
});
