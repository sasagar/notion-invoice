import { Link } from "waku";
import { StatusTag } from "@/components/status-tag";
import { formatDate } from "@/lib/format";
import type { InvoiceMeta } from "@/lib/notion/types";

export function InvoiceCard({ meta, customerName }: { meta: InvoiceMeta; customerName: string }) {
  return (
    <li>
      <Link
        to={`/invoice/item/${meta.id}`}
        className="block rounded-xl border border-stone-200 bg-white p-4 shadow-sm transition hover:border-kent-blue-300 hover:shadow dark:border-slate-800 dark:bg-slate-900 dark:hover:border-kent-blue-700"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="truncate font-medium">{meta.title || "(件名なし)"}</div>
            {customerName && (
              <div className="truncate text-sm text-stone-500 dark:text-slate-400">
                {customerName}
              </div>
            )}
          </div>
          <StatusTag status={meta.status} />
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-stone-400 dark:text-slate-500">
          <span>#{meta.id}</span>
          {meta.dueTo && <span>支払期限 {formatDate(meta.dueTo)}</span>}
        </div>
      </Link>
    </li>
  );
}
