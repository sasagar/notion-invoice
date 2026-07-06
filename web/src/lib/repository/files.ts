/**
 * ファイル（印影画像等）を DB の BLOB として保存/取得/削除する（files 表）。
 * 配信ルート `/api/files/{id}` は getFileForOwner を使って owner 一致のみ返す。
 */
import { randomUUID } from "node:crypto";
import { asRow, num, str } from "@/lib/repository/row";
import type { AppDatabase } from "@/lib/schema";

/** insertFile の入力。kind は省略時 'seal'。 */
export type FileInput = {
  kind?: string;
  mimeType: string;
  byteSize: number;
  data: Buffer;
};

/** 取得したファイル 1 件。 */
export type FileRecord = {
  id: string;
  kind: string;
  mimeType: string;
  byteSize: number;
  data: Buffer;
};

/** SELECT * の行を FileRecord へ写す（data は必ず Buffer 化）。 */
function mapFileRow(row: unknown): FileRecord {
  const r = asRow(row);
  const data = r["data"];
  return {
    id: str(r["id"]),
    kind: str(r["kind"]),
    mimeType: str(r["mime_type"]),
    byteSize: num(r["byte_size"]),
    data: Buffer.isBuffer(data) ? data : Buffer.from([]),
  };
}

/** ファイルを 1 件保存し、生成した id を返す。 */
export function insertFile(db: AppDatabase, ownerId: string, input: FileInput): string {
  const id = randomUUID();
  db.prepare(`
    INSERT INTO files (id, owner_id, kind, mime_type, byte_size, data)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, ownerId, input.kind ?? "seal", input.mimeType, input.byteSize, input.data);
  return id;
}

/** id 指定でファイルを取得（無ければ null）。 */
export function getFile(db: AppDatabase, id: string): FileRecord | null {
  const row = db.prepare("SELECT * FROM files WHERE id = ?").get(id);
  return row === undefined ? null : mapFileRow(row);
}

/** owner 一致のファイルを取得（配信ルートの owner スコープ確認用。無ければ null）。 */
export function getFileForOwner(db: AppDatabase, ownerId: string, id: string): FileRecord | null {
  const row = db.prepare("SELECT * FROM files WHERE owner_id = ? AND id = ?").get(ownerId, id);
  return row === undefined ? null : mapFileRow(row);
}

/** id 指定で削除（owner 一致のみ。accounts.seal_file_id は ON DELETE SET NULL）。 */
export function deleteFile(db: AppDatabase, ownerId: string, id: string): boolean {
  const res = db.prepare("DELETE FROM files WHERE owner_id = ? AND id = ?").run(ownerId, id);
  return res.changes > 0;
}
