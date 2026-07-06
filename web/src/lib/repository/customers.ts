/**
 * 顧客マスタ（customers 表）の読み書き。既存ドメイン型 Customer をそのまま返す。
 */
import { randomUUID } from "node:crypto";
import type { Customer } from "@/lib/notion/types";
import { asRow, str } from "@/lib/repository/row";
import type { AppDatabase } from "@/lib/schema";

/** upsert の入力。notion_page_id は import では必須、手動作成時は null。 */
export type CustomerInput = {
  notionPageId: string | null;
  name: string;
  companyName: string;
  honorific: string;
  companyInfo: string;
  contactName: string;
};

function mapCustomerRow(row: Record<string, unknown>): Customer {
  return {
    name: str(row["name"]),
    companyName: str(row["company_name"]),
    honorific: str(row["honorific"]),
    companyInfo: str(row["company_info"]),
    contactName: str(row["contact_name"]),
  };
}

/** オーナーの顧客一覧（顧客名昇順）。 */
export function listCustomers(db: AppDatabase, ownerId: string): Customer[] {
  const rows = db.prepare("SELECT * FROM customers WHERE owner_id = ? ORDER BY name").all(ownerId);
  return rows.map((r) => mapCustomerRow(asRow(r)));
}

/** id 指定で 1 件取得（無ければ null）。 */
export function getCustomer(db: AppDatabase, ownerId: string, id: string): Customer | null {
  const row = db.prepare("SELECT * FROM customers WHERE owner_id = ? AND id = ?").get(ownerId, id);
  return row === undefined ? null : mapCustomerRow(asRow(row));
}

/**
 * notion_page_id をキーに upsert（冪等 import 用）。作成/更新した行の id を返す。
 * notion_page_id が null の場合は常に新規作成（NULL は互いに衝突しない）。
 */
export function upsertCustomer(db: AppDatabase, ownerId: string, input: CustomerInput): string {
  const id = randomUUID();
  const row = db
    .prepare(`
      INSERT INTO customers
        (id, owner_id, name, company_name, honorific, company_info, contact_name, notion_page_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(notion_page_id) DO UPDATE SET
        name = excluded.name,
        company_name = excluded.company_name,
        honorific = excluded.honorific,
        company_info = excluded.company_info,
        contact_name = excluded.contact_name,
        updated_at = datetime('now')
      RETURNING id
    `)
    .get(
      id,
      ownerId,
      input.name,
      input.companyName,
      input.honorific,
      input.companyInfo,
      input.contactName,
      input.notionPageId,
    );
  return str(asRow(row)["id"]);
}
