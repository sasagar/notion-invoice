import type { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section
      className={`rounded-lg border border-paper-line bg-white/70 p-5 dark:border-slate-800 dark:bg-slate-900/40 ${className}`}
    >
      {children}
    </section>
  );
}

/** 小さめ・トラッキング広めのセクション見出し（kent-blue のアクセントバー付き）。 */
export function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-stone-500 dark:text-slate-400">
      <span className="inline-block h-3 w-1 rounded-full bg-kent-blue-400" />
      {children}
    </h2>
  );
}
