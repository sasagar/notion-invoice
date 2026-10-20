import { Link } from "waku";
import { StatusStamp } from "@/components/status-stamp";
import { StatusStampSelect } from "@/components/status-stamp-select";
import { formatDate, formatYen } from "@/lib/format";
import { isOverdue } from "@/lib/invoice-list";
import type { InvoiceListItem } from "@/lib/notion/fetchers";

export function InvoiceCard({ item, today }: { item: InvoiceListItem; today: string }) {
  const { meta, customerName, totalAmount, editorId } = item;
  const overdue = isOverdue(item, today);
  return (
    <li className="flex items-center gap-3 px-3 py-3 transition hover:bg-kent-blue-500/5 sm:gap-4 sm:px-4 sm:py-3.5 dark:hover:bg-kent-blue-400/5">
      {/* SQLiteモードではスタンプ自体がステータス変更のトリガーになる（Link の外） */}
      {editorId ? (
        <StatusStampSelect id={editorId} status={meta.status} />
      ) : (
        <StatusStamp status={meta.status} />
      )}
      <Link to={`/invoice/item/${meta.id}`} className="flex min-w-0 flex-1 items-center gap-3">
        <div className="min-w-0 flex-1">
          <div className="truncate font-medium text-stone-800 dark:text-slate-100">
            {meta.title || "(件名なし)"}
          </div>
          <div className="mt-0.5 flex min-w-0 items-center gap-x-2 text-xs text-stone-500 dark:text-slate-400">
            <span className="shrink-0 font-mono text-stone-400 dark:text-slate-500">
              #{meta.id}
            </span>
            {customerName && <span className="truncate">{customerName}</span>}
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div className="font-mono text-base font-semibold tabular-nums text-stone-800 dark:text-slate-100">
            {totalAmount === null ? "—" : formatYen(totalAmount)}
          </div>
          {overdue ? (
            <div className="text-xs font-bold text-shuiro-600 dark:text-shuiro-400">
              期限超過{" "}
              {meta.dueTo && <span className="hidden sm:inline">{formatDate(meta.dueTo)}</span>}
            </div>
          ) : (
            meta.dueTo && (
              // スマホでは件名の幅を優先し、期限は超過したときだけ出す。
              <div className="hidden text-xs text-stone-400 sm:block dark:text-slate-500">
                {`支払期限 ${formatDate(meta.dueTo)}`}
              </div>
            )
          )}
        </div>
      </Link>
    </li>
  );
}
