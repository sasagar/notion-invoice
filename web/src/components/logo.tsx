export function Logo({ className }: { className?: string }) {
  return (
    <span className={className}>
      <span className="font-bold tracking-tight text-kent-blue-500 dark:text-kent-blue-200">
        BKTSK
      </span>{" "}
      <span className="text-stone-500 dark:text-slate-400">Invoice</span>
    </span>
  );
}
