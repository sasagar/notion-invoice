import type { ReactNode } from "react";
import { LuPlus } from "react-icons/lu";

/**
 * マスタ一覧の「新規追加」フォームを折りたたんで置く。普段は一覧を主役にし、
 * 1 件も無いときだけ最初から開いておく。
 */
export function NewRecordPanel({ open, children }: { open: boolean; children: ReactNode }) {
  return (
    <details
      open={open}
      className="group mb-4 rounded-lg border border-paper-line bg-white/70 dark:border-slate-800 dark:bg-slate-900/40"
    >
      <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 px-5 text-sm font-bold text-kent-blue-600 select-none dark:text-kent-blue-200 [&::-webkit-details-marker]:hidden">
        <LuPlus aria-hidden className="transition group-open:rotate-45" />
        新規追加
      </summary>
      <div className="border-t border-paper-line px-5 pt-4 pb-5 dark:border-slate-800">
        {children}
      </div>
    </details>
  );
}
