/**
 * 自社（請求元）マスタ（accounts 表）の読み書き。既存ドメイン型 Account を返す。
 * 印影は files 表に格納し、sealImageUrl は配信ルートの URL 形式で返す
 * （配信ルート自体は Phase 2 で実装。ここでは URL 形式だけ確定させる）。
 */
import { randomUUID } from "node:crypto";
import type { Account } from "@/lib/notion/types";
import { asRow, str, strOrNull } from "@/lib/repository/row";
import type { AppDatabase } from "@/lib/schema";

/** upsert の入力。notion_page_id は import では必須、手動作成時は null。 */
export type AccountInput = {
  notionPageId: string | null;
  slug: string;
  companyName: string;
  contactName: string;
  companyInfo: string;
  bankInfo: string;
  registrationNumber: string;
  sealFileId: string | null;
};

function mapAccountRow(row: Record<string, unknown>): Account {
  const sealFileId = strOrNull(row["seal_file_id"]);
  return {
    contactName: str(row["contact_name"]),
    companyName: str(row["company_name"]),
    sealImageUrl: sealFileId ? `/api/files/${sealFileId}` : null,
    companyInfo: str(row["company_info"]),
    bankInfo: str(row["bank_info"]),
    registrationNumber: str(row["registration_number"]),
    slug: str(row["slug"]),
  };
}

/** オーナーの自社情報一覧（会社名昇順）。 */
export function listAccounts(db: AppDatabase, ownerId: string): Account[] {
  const rows = db
    .prepare("SELECT * FROM accounts WHERE owner_id = ? ORDER BY company_name")
    .all(ownerId);
  return rows.map((r) => mapAccountRow(asRow(r)));
}

/** id 指定で 1 件取得（無ければ null）。 */
export function getAccount(db: AppDatabase, ownerId: string, id: string): Account | null {
  const row = db.prepare("SELECT * FROM accounts WHERE owner_id = ? AND id = ?").get(ownerId, id);
  return row === undefined ? null : mapAccountRow(asRow(row));
}

/**
 * notion_page_id をキーに upsert（冪等 import 用）。作成/更新した行の id を返す。
 * notion_page_id が null の場合は常に新規作成。
 */
export function upsertAccount(db: AppDatabase, ownerId: string, input: AccountInput): string {
  const id = randomUUID();
  const row = db
    .prepare(`
      INSERT INTO accounts
        (id, owner_id, slug, company_name, contact_name, company_info,
         bank_info, registration_number, seal_file_id, notion_page_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(notion_page_id) DO UPDATE SET
        slug = excluded.slug,
        company_name = excluded.company_name,
        contact_name = excluded.contact_name,
        company_info = excluded.company_info,
        bank_info = excluded.bank_info,
        registration_number = excluded.registration_number,
        seal_file_id = excluded.seal_file_id,
        updated_at = datetime('now')
      RETURNING id
    `)
    .get(
      id,
      ownerId,
      input.slug,
      input.companyName,
      input.contactName,
      input.companyInfo,
      input.bankInfo,
      input.registrationNumber,
      input.sealFileId,
      input.notionPageId,
    );
  return str(asRow(row)["id"]);
}
