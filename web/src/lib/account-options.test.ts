import { describe, expect, test } from "vitest";
import { buildAccountOptions } from "@/lib/account-options";

const records = [
  { id: "a", contactName: "担当A", companyName: "自社", archivedAt: null },
  { id: "old", contactName: "担当A", companyName: "自社", archivedAt: "2026-01-01 00:00:00" },
  { id: "b", contactName: "", companyName: "別会社", archivedAt: null },
];

describe("buildAccountOptions", () => {
  test("新規作成ではアーカイブ済みを出さない", () => {
    expect(buildAccountOptions(records, "new")).toEqual([
      { id: "a", label: "担当A" },
      { id: "b", label: "別会社" },
    ]);
  });

  test("編集では有効 → アーカイブ済み（ラベル付き）の順に全件出す", () => {
    expect(buildAccountOptions(records, "edit")).toEqual([
      { id: "a", label: "担当A" },
      { id: "b", label: "別会社" },
      { id: "old", label: "担当A（アーカイブ済み）" },
    ]);
  });
});
