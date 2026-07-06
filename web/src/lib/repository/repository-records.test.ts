import Database from "better-sqlite3";
import { beforeEach, describe, expect, test } from "vitest";
import {
  createAccount,
  createCustomer,
  getAccountRecord,
  getAccountSealFileIdById,
  getCustomerRecord,
  insertFile,
  listAccountRecords,
  listCustomerRecords,
  updateCustomer,
} from "@/lib/repository";
import { applyAppSchema } from "@/lib/schema";

const OWNER = "u1";

function makeDb(): Database.Database {
  const db = new Database(":memory:");
  db.pragma("foreign_keys = ON");
  db.exec("CREATE TABLE user (id TEXT PRIMARY KEY)");
  applyAppSchema(db);
  db.prepare("INSERT INTO user (id) VALUES (?)").run(OWNER);
  return db;
}

describe("repository 管理画面用レコード取得", () => {
  let db: Database.Database;
  beforeEach(() => {
    db = makeDb();
  });

  test("listCustomerRecords / getCustomerRecord は id 付きで返す", () => {
    const id = createCustomer(db, OWNER, {
      name: "太郎",
      companyName: "A社",
      honorific: "御中",
      companyInfo: "東京",
      contactName: "田中",
    });
    const list = listCustomerRecords(db, OWNER);
    expect(list).toHaveLength(1);
    expect(list[0]?.id).toBe(id);
    expect(list[0]?.companyName).toBe("A社");

    const rec = getCustomerRecord(db, OWNER, id);
    expect(rec?.id).toBe(id);
    expect(rec?.contactName).toBe("田中");
    expect(getCustomerRecord(db, OWNER, "no")).toBeNull();

    // 更新が反映される
    updateCustomer(db, OWNER, id, {
      name: "太郎",
      companyName: "A社改",
      honorific: "御中",
      companyInfo: "東京",
      contactName: "田中",
    });
    expect(getCustomerRecord(db, OWNER, id)?.companyName).toBe("A社改");
  });

  test("listAccountRecords / getAccountRecord は id・sealFileId・data URI を返す", () => {
    const data = Buffer.from([1, 2, 3]);
    const fileId = insertFile(db, OWNER, { mimeType: "image/png", byteSize: data.length, data });
    const id = createAccount(db, OWNER, {
      slug: "self",
      companyName: "自社",
      contactName: "担当",
      companyInfo: "",
      bankInfo: "",
      registrationNumber: "T1",
      sealFileId: fileId,
    });

    const rec = getAccountRecord(db, OWNER, id);
    expect(rec?.id).toBe(id);
    expect(rec?.sealFileId).toBe(fileId);
    expect(rec?.sealImageUrl).toBe(`data:image/png;base64,${data.toString("base64")}`);

    expect(listAccountRecords(db, OWNER)).toHaveLength(1);
    expect(getAccountSealFileIdById(db, OWNER, id)).toBe(fileId);
    expect(getAccountRecord(db, OWNER, "no")).toBeNull();
  });
});
