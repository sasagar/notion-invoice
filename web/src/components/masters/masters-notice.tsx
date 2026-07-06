import { Card, SectionHeading } from "@/components/card";

/** notion 読み取りモードのとき、マスタ編集画面の代わりに表示する案内カード。 */
export function MastersNotice() {
  return (
    <Card>
      <SectionHeading>マスタ編集は SQLite モードのみ</SectionHeading>
      <p className="text-sm leading-relaxed text-stone-500 dark:text-slate-400">
        現在は Notion 読み取りモードです。マスタ（顧客・自社・項目）の編集は{" "}
        <code className="rounded bg-stone-100 px-1 py-0.5 font-mono text-xs dark:bg-slate-800">
          DATA_BACKEND=sqlite
        </code>{" "}
        のときに利用できます。
      </p>
    </Card>
  );
}
