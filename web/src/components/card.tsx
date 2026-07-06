import type { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section
      className={`rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm ring-1 ring-black/[0.02] dark:border-slate-800 dark:bg-slate-900 dark:ring-white/[0.02] ${className}`}
    >
      {children}
    </section>
  );
}

/** 小さめ・トラッキング広めのセクション見出し（kent-blue のアクセントバー付き）。 */
export function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-slate-400">
      <span className="inline-block h-3.5 w-1 rounded-full bg-kent-blue-400" />
      {children}
    </h2>
  );
}
