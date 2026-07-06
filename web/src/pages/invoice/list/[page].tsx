import process from "node:process";
import { Suspense } from "react";
import { ErrorState } from "@/components/data-states";
import { InvoiceCard } from "@/components/invoice-card";
import { Pagination } from "@/components/pagination";
import { listInvoices, listInvoicesWithTotals } from "@/lib/notion/fetchers";
import { requireSession } from "@/lib/session";

export default function InvoiceListPage({ page }: { page: string }) {
  return (
    <div>
      <div className="mb-6 flex items-baseline justify-between">
        <h1 className="font-display text-2xl font-bold text-kent-blue-500 dark:text-kent-blue-200">
          請求書
        </h1>
      </div>
      <Suspense fallback={<InvoiceListSkeleton />}>
        <InvoiceListBody page={page} />
      </Suspense>
    </div>
  );
}

async function InvoiceListBody({ page }: { page: string }) {
  const session = await requireSession();
  const userId = session.user.id;
  const perPage = Math.max(1, Number(process.env.PER_PAGE ?? 20));
  const pageNum = Math.max(1, Number(page) || 1);

  let raw;
  try {
    raw = await listInvoices(userId);
  } catch (e) {
    return <ErrorState message={e instanceof Error ? e.message : "取得に失敗しました"} />;
  }

  const total = raw.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const start = (pageNum - 1) * perPage;
  const rawPageItems = raw.slice(start, start + perPage);
  const items = await listInvoicesWithTotals(userId, pageNum, rawPageItems);

  return (
    <>
      <div className="mb-3 text-right font-mono text-xs text-stone-400 dark:text-slate-500">
        全 {total} 件
      </div>
      {items.length === 0 ? (
        <p className="rounded-lg border border-paper-line bg-white/70 p-8 text-center text-stone-500 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-400">
          請求書がありません。
        </p>
      ) : (
        <ul className="divide-y divide-paper-line rounded-lg border border-paper-line bg-white/70 dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900/40">
          {items.map((item) => (
            <InvoiceCard key={item.meta.id || item.meta.title} item={item} />
          ))}
        </ul>
      )}
      <Pagination current={pageNum} totalPages={totalPages} />
    </>
  );
}

function InvoiceListSkeleton() {
  return (
    <div className="divide-y divide-paper-line rounded-lg border border-paper-line bg-white/70 dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900/40">
      {["a", "b", "c", "d", "e", "f"].map((k) => (
        <div key={k} className="flex items-center gap-4 px-4 py-3.5">
          <div className="skeleton h-6 w-16 shrink-0 rounded-[2px]" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-4 w-2/5 rounded" />
            <div className="skeleton h-3 w-1/4 rounded" />
          </div>
          <div className="skeleton h-6 w-20 rounded" />
        </div>
      ))}
    </div>
  );
}

export const getConfig = async () => ({ render: "dynamic" as const });
