/**
 * 項目マスタ（items 表）の読み書き。項目名+単価のみの小さな表。
 * 既存ドメイン型が無いため、ここで最小の ItemMaster 型を定義する。
 */
import { randomUUID } from "node:crypto";
import { asRow, num, str, strOrNull } from "@/lib/repository/row";
import type { AppDatabase } from "@/lib/schema";

/** 項目マスタ 1 件。単価は税抜。 */
export type ItemMaster = {
  id: string;
  name: string;
  unitPrice: number;
  notionPageId: string | null;
};

/** upsert の入力。notion_page_id は import では必須、手動作成時は null。 */
export type ItemInput = {
  notionPageId: string | null;
  name: string;
  unitPrice: number;
};

function mapItemRow(row: Record<string, unknown>): ItemMaster {
  return {
    id: str(row["id"]),
    name: str(row["name"]),
    unitPrice: num(row["unit_price"]),
    notionPageId: strOrNull(row["notion_page_id"]),
  };
}

/** オーナーの項目一覧（項目名昇順）。 */
export function listItems(db: AppDatabase, ownerId: string): ItemMaster[] {
  const rows = db.prepare("SELECT * FROM items WHERE owner_id = ? ORDER BY name").all(ownerId);
  return rows.map((r) => mapItemRow(asRow(r)));
}

/** id 指定で 1 件取得（無ければ null）。 */
export function getItem(db: AppDatabase, ownerId: string, id: string): ItemMaster | null {
  const row = db.prepare("SELECT * FROM items WHERE owner_id = ? AND id = ?").get(ownerId, id);
  return row === undefined ? null : mapItemRow(asRow(row));
}

/**
 * notion_page_id をキーに upsert（冪等 import 用）。作成/更新した行の id を返す。
 * notion_page_id が null の場合は常に新規作成。
 */
export function upsertItem(db: AppDatabase, ownerId: string, input: ItemInput): string {
  const id = randomUUID();
  const row = db
    .prepare(`
      INSERT INTO items (id, owner_id, name, unit_price, notion_page_id)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(notion_page_id) DO UPDATE SET
        name = excluded.name,
        unit_price = excluded.unit_price,
        updated_at = datetime('now')
      RETURNING id
    `)
    .get(id, ownerId, input.name, input.unitPrice, input.notionPageId);
  return str(asRow(row)["id"]);
}
