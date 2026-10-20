import process from "node:process";
import { Suspense } from "react";
import { ErrorState } from "@/components/data-states";
import { InvoiceCard } from "@/components/invoice-card";
import { InvoiceFilters } from "@/components/invoice-filters";
import { InvoiceSummary } from "@/components/invoice-summary";
import { Pagination } from "@/components/pagination";
import { type InvoiceListView, isSqliteBackend, listInvoiceView } from "@/lib/data/backend";
import { db } from "@/lib/db";
import { todayInTokyo } from "@/lib/format";
import { hasListFilter, parseListQuery, toListQuery } from "@/lib/invoice-list";
import { listCustomerRecords } from "@/lib/repository";
import { requireSession } from "@/lib/session";

export default function InvoiceListPage({ page, query }: { page: string; query: string }) {
  return (
    <div>
      <div className="mb-5">
        <h1 className="font-display text-2xl font-bold text-kent-blue-500 dark:text-kent-blue-200">
          請求書
        </h1>
      </div>
      <Suspense key={`${page}${query}`} fallback={<InvoiceListSkeleton />}>
        <InvoiceListBody page={page} query={query} />
      </Suspense>
    </div>
  );
}

async function InvoiceListBody({ page, query }: { page: string; query: string }) {
  const session = await requireSession();
  const userId = session.user.id;
  const perPage = Math.max(1, Number(process.env.PER_PAGE ?? 10));
  const pageNum = Math.max(1, Number(page) || 1);
  const sqlite = isSqliteBackend();
  // 絞り込みは SQLite のときだけ（notion ではクエリを無視して従来の一覧を出す）。
  const filter = sqlite ? parseListQuery(query) : {};

  let view: InvoiceListView;
  try {
    view = await listInvoiceView(userId, pageNum, perPage, filter);
  } catch (e) {
    return <ErrorState message={e instanceof Error ? e.message : "取得に失敗しました"} />;
  }

  const { items, total, summary } = view;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const today = todayInTokyo();
  const customers = sqlite
    ? listCustomerRecords(db, userId).map((c) => ({
        id: c.id,
        label: `${c.companyName || c.name}${c.archivedAt ? "（アーカイブ済み）" : ""}`,
      }))
    : [];
  const filtered = hasListFilter(filter);

  return (
    <>
      {summary && <InvoiceSummary summary={summary} />}
      {sqlite && <InvoiceFilters filter={filter} customers={customers} />}
      <div className="mb-2 text-right font-mono text-xs text-stone-400 dark:text-slate-500">
        {filtered ? `該当 ${total} 件` : `全 ${total} 件`}
      </div>
      {items.length === 0 ? (
        <p className="rounded-lg border border-paper-line bg-white/70 p-8 text-center text-stone-500 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-400">
          {filtered ? "条件に合う請求書がありません。" : "請求書がありません。"}
        </p>
      ) : (
        <ul className="divide-y divide-paper-line overflow-hidden rounded-lg border border-paper-line bg-white/70 dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900/40">
          {items.map((item) => (
            <InvoiceCard key={item.meta.id || item.meta.title} item={item} today={today} />
          ))}
        </ul>
      )}
      <Pagination current={pageNum} totalPages={totalPages} query={toListQuery(filter)} />
    </>
  );
}

function InvoiceListSkeleton() {
  return (
    <>
      <div className="mb-5 grid grid-cols-3 gap-2 sm:gap-4">
        {["a", "b", "c"].map((k) => (
          <div key={k} className="skeleton h-20 rounded-lg sm:h-24" />
        ))}
      </div>
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
    </>
  );
}

export const getConfig = async () => ({ render: "dynamic" as const });
