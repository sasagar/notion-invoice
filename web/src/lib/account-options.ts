/**
 * 請求書エディタの「自社（振込先）」選択肢を組み立てる純粋関数。
 * 振込先は銀行の行名変更などで使わなくなったものをアーカイブしておく運用なので、
 * 新規作成と既存の編集で出す範囲を変える。
 */

/** 選択肢の材料（AccountRecord の必要な列だけ）。 */
export type AccountOptionSource = {
  id: string;
  contactName: string;
  companyName: string;
  archivedAt: string | null;
};

export type AccountOption = { id: string; label: string };

/**
 * - 新規作成（mode="new"）: 有効なものだけ。アーカイブ済みの旧振込先を新しい請求書に選ばせない。
 * - 既存の編集（mode="edit"）: 有効なもの → アーカイブ済み（ラベル付き）の順に全件。
 *   過去の請求書を旧行名の振込先へ付け替えられるようにするため、また編集中の請求書が
 *   参照しているアーカイブ済みの振込先が勝手に外れないようにするため。
 * 選択ラベルは担当者名（自社マスタの表示名として流用）。空なら会社名。
 */
export function buildAccountOptions(
  records: readonly AccountOptionSource[],
  mode: "new" | "edit",
): AccountOption[] {
  const label = (r: AccountOptionSource) => r.contactName || r.companyName;
  const active = records
    .filter((r) => r.archivedAt === null)
    .map((r) => ({ id: r.id, label: label(r) }));
  if (mode === "new") {
    return active;
  }
  const archived = records
    .filter((r) => r.archivedAt !== null)
    .map((r) => ({ id: r.id, label: `${label(r)}（アーカイブ済み）` }));
  return [...active, ...archived];
}
