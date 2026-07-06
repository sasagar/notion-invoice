import { Link } from "waku";
import { StatusStamp } from "@/components/status-stamp";
import { formatDate, formatDateTime, formatYen } from "@/lib/format";
import type { InvoiceListItem } from "@/lib/notion/fetchers";

export function InvoiceCard({ item }: { item: InvoiceListItem }) {
  const { meta, customerName, totalAmount } = item;
  return (
    <li>
      <Link
        to={`/invoice/item/${meta.id}`}
        className="flex items-center gap-4 px-4 py-3.5 transition hover:bg-kent-blue-500/5 dark:hover:bg-kent-blue-400/5"
      >
        <StatusStamp status={meta.status} className="text-[10px]" />
        <div className="min-w-0 flex-1">
          <div className="truncate font-medium text-stone-800 dark:text-slate-100">
            {meta.title || "(件名なし)"}
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 font-mono text-xs text-stone-400 dark:text-slate-500">
            <span>#{meta.id}</span>
            {customerName && (
              <span className="truncate font-sans text-stone-500 dark:text-slate-400">
                {customerName}
              </span>
            )}
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div className="font-mono text-base font-semibold tabular-nums text-stone-800 dark:text-slate-100">
            {totalAmount === null ? "—" : formatYen(totalAmount)}
          </div>
          <div className="hidden font-mono text-xs text-stone-400 dark:text-slate-500 sm:block">
            {meta.dueTo && <span>期限 {formatDate(meta.dueTo)} ・ </span>}
            更新 {formatDateTime(meta.updatedAt)}
          </div>
        </div>
      </Link>
    </li>
  );
}
