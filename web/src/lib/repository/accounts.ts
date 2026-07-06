/**
 * 自社（請求元）マスタ（accounts 表）の読み書き。既存ドメイン型 Account を返す。
 * 印影は files 表に BLOB として格納し、sealImageUrl は
 * `data:<mime>;base64,<...>` の data URI で返す（Web の <img> と @react-pdf の
 * <Image> の両方が追加実装なしに表示できる。印影は数十KBなので inline で問題ない）。
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

// 印影の BLOB を JOIN で同時に取得し、data URI 化できるようにする。
// accounts 側の列と衝突しないよう別名（seal_mime_type / seal_data）で受ける。
const ACCOUNT_SELECT = `
  SELECT a.*, f.mime_type AS seal_mime_type, f.data AS seal_data
  FROM accounts a
  LEFT JOIN files f ON f.id = a.seal_file_id
`;

/** 印影の mime と BLOB から data URI を組み立てる（欠損時は null）。 */
function sealDataUri(mime: unknown, data: unknown): string | null {
  if (typeof mime !== "string" || mime.length === 0 || !Buffer.isBuffer(data)) {
    return null;
  }
  return `data:${mime};base64,${data.toString("base64")}`;
}

function mapAccountRow(row: Record<string, unknown>): Account {
  return {
    contactName: str(row["contact_name"]),
    companyName: str(row["company_name"]),
    sealImageUrl: sealDataUri(row["seal_mime_type"], row["seal_data"]),
    companyInfo: str(row["company_info"]),
    bankInfo: str(row["bank_info"]),
    registrationNumber: str(row["registration_number"]),
    slug: str(row["slug"]),
  };
}

/** オーナーの自社情報一覧（会社名昇順）。 */
export function listAccounts(db: AppDatabase, ownerId: string): Account[] {
  const rows = db
    .prepare(`${ACCOUNT_SELECT} WHERE a.owner_id = ? ORDER BY a.company_name`)
    .all(ownerId);
  return rows.map((r) => mapAccountRow(asRow(r)));
}

/** id 指定で 1 件取得（無ければ null）。 */
export function getAccount(db: AppDatabase, ownerId: string, id: string): Account | null {
  const row = db.prepare(`${ACCOUNT_SELECT} WHERE a.owner_id = ? AND a.id = ?`).get(ownerId, id);
  return row === undefined ? null : mapAccountRow(asRow(row));
}

/** notion_page_id 指定で既存の印影ファイル id を返す（未登録/未設定なら null）。 */
export function getAccountSealFileId(
  db: AppDatabase,
  ownerId: string,
  notionPageId: string,
): string | null {
  const row = db
    .prepare("SELECT seal_file_id FROM accounts WHERE owner_id = ? AND notion_page_id = ?")
    .get(ownerId, notionPageId);
  return row === undefined ? null : strOrNull(asRow(row)["seal_file_id"]);
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

/** 手動編集の入力（notion_page_id を持たないフィールドのみ。sealFileId は含む）。 */
export type AccountFields = Omit<AccountInput, "notionPageId">;

/** 手動作成: notion_page_id を持たない新規行を作成し、id を返す。 */
export function createAccount(db: AppDatabase, ownerId: string, input: AccountFields): string {
  return upsertAccount(db, ownerId, { notionPageId: null, ...input });
}

/** 手動編集: id 指定で更新（notion_page_id は変更しない）。更新できたら true。 */
export function updateAccount(
  db: AppDatabase,
  ownerId: string,
  id: string,
  input: AccountFields,
): boolean {
  const res = db
    .prepare(`
      UPDATE accounts SET
        slug = ?, company_name = ?, contact_name = ?, company_info = ?,
        bank_info = ?, registration_number = ?, seal_file_id = ?, updated_at = datetime('now')
      WHERE owner_id = ? AND id = ?
    `)
    .run(
      input.slug,
      input.companyName,
      input.contactName,
      input.companyInfo,
      input.bankInfo,
      input.registrationNumber,
      input.sealFileId,
      ownerId,
      id,
    );
  return res.changes > 0;
}

/** 手動編集: id 指定で削除（invoices.account_id は ON DELETE SET NULL）。削除できたら true。 */
export function deleteAccount(db: AppDatabase, ownerId: string, id: string): boolean {
  const res = db.prepare("DELETE FROM accounts WHERE owner_id = ? AND id = ?").run(ownerId, id);
  return res.changes > 0;
}
