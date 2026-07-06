import { Link } from "waku";
import { StatusTag } from "@/components/status-tag";
import { formatDate } from "@/lib/format";
import type { InvoiceMeta } from "@/lib/notion/types";

export function InvoiceCard({ meta, customerName }: { meta: InvoiceMeta; customerName: string }) {
  return (
    <li>
      <Link
        to={`/invoice/item/${meta.id}`}
        className="group block overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm ring-1 ring-black/[0.02] transition hover:-translate-y-0.5 hover:border-kent-blue-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:ring-white/[0.02] dark:hover:border-kent-blue-700"
      >
        <div className="flex items-stretch">
          <div className="w-1.5 shrink-0 bg-kent-blue-400/70 transition group-hover:bg-kent-blue-500" />
          <div className="min-w-0 flex-1 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate font-semibold">{meta.title || "(件名なし)"}</div>
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
          </div>
        </div>
      </Link>
    </li>
  );
}
