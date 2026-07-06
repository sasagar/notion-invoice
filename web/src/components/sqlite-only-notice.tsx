import type { ReactNode } from "react";
import { Card, SectionHeading } from "@/components/card";

/** notion 読み取りモードのとき、編集画面の代わりに表示する案内カード。 */
export function SqliteOnlyNotice({ children }: { children: ReactNode }) {
  return (
    <Card>
      <SectionHeading>SQLite モードのみ</SectionHeading>
      <p className="text-sm leading-relaxed text-stone-500 dark:text-slate-400">{children}</p>
    </Card>
  );
}
