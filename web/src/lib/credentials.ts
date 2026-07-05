import { decryptSecret, encryptSecret } from "@/lib/crypto/credentials";
import { db } from "@/lib/db";

export type NotionCredentials = { dbId: string; apiKey: string };

type Row = { db_id_enc: string; api_key_enc: string };

/**
 * ユーザーの Notion 資格情報を復号して返す（サーバ側のみ）。未登録なら null。
 */
export function getCredentials(userId: string): NotionCredentials | null {
  const row = db
    .prepare("SELECT db_id_enc, api_key_enc FROM notion_credentials WHERE user_id = ?")
    .get(userId) as Row | undefined;
  if (!row) {
    return null;
  }
  return {
    dbId: decryptSecret(row.db_id_enc),
    apiKey: decryptSecret(row.api_key_enc),
  };
}

/**
 * 資格情報が登録済みかどうか（復号せずに存在のみ確認）。
 */
export function hasCredentials(userId: string): boolean {
  const row = db.prepare("SELECT 1 FROM notion_credentials WHERE user_id = ?").get(userId);
  return row !== undefined;
}

/**
 * ユーザーの Notion 資格情報を暗号化して upsert する。
 */
export function upsertCredentials(userId: string, creds: NotionCredentials): void {
  const dbIdEnc = encryptSecret(creds.dbId);
  const apiKeyEnc = encryptSecret(creds.apiKey);
  db.prepare(
    `INSERT INTO notion_credentials (user_id, db_id_enc, api_key_enc, updated_at)
     VALUES (?, ?, ?, datetime('now'))
     ON CONFLICT(user_id) DO UPDATE SET
       db_id_enc = excluded.db_id_enc,
       api_key_enc = excluded.api_key_enc,
       updated_at = datetime('now')`,
  ).run(userId, dbIdEnc, apiKeyEnc);
}
