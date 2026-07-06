export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-baseline gap-2 ${className}`}>
      <span className="font-display text-xl font-bold tracking-wide text-kent-blue-500 dark:text-kent-blue-200">
        BKTSK
      </span>
      <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-stone-400 dark:text-slate-500">
        Invoice
      </span>
    </span>
  );
}
