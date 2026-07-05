const STYLES: Record<string, string> = {
  ドラフト: "bg-stone-100 text-stone-600 dark:bg-slate-800 dark:text-slate-300",
  見積送付済み: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
  請求書送付済み: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
};
const DONE = "bg-lime-100 text-lime-700 dark:bg-lime-950 dark:text-lime-300";

export function StatusTag({ status }: { status: string }) {
  const cls = STYLES[status] ?? DONE;
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      {status || "—"}
    </span>
  );
}
