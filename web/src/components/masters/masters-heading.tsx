import type { ReactNode } from "react";

/** マスタ画面の見出し（font-display・kent-blue）。breadcrumb に戻り Link を渡せる。 */
export function MastersHeading({ title, breadcrumb }: { title: string; breadcrumb?: ReactNode }) {
  return (
    <div className="mb-6">
      {breadcrumb && (
        <div className="mb-1 font-mono text-xs text-stone-400 dark:text-slate-500">
          {breadcrumb}
        </div>
      )}
      <h1 className="font-display text-2xl font-bold text-kent-blue-500 dark:text-kent-blue-200">
        {title}
      </h1>
    </div>
  );
}
