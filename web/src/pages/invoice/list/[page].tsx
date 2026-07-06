import process from "node:process";
import { Suspense } from "react";
import { ErrorState } from "@/components/data-states";
import { InvoiceCard } from "@/components/invoice-card";
import { Pagination } from "@/components/pagination";
import { getPage, listInvoices } from "@/lib/notion/fetchers";
import { mapCustomer, mapInvoiceMeta } from "@/lib/notion/mapper";
import { requireSession } from "@/lib/session";

export default function InvoiceListPage({ page }: { page: string }) {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">請求書</h1>
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

  const metas = raw.map(mapInvoiceMeta);
  const total = metas.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const start = (pageNum - 1) * perPage;
  const pageItems = metas.slice(start, start + perPage);

  const items = await Promise.all(
    pageItems.map(async (meta) => {
      let customerName = "";
      if (meta.customerRelationId) {
        try {
          const c = mapCustomer(await getPage(userId, meta.customerRelationId));
          customerName = c.companyName || c.name;
        } catch {
          // 顧客名の取得失敗は空のまま続行
        }
      }
      return { meta, customerName };
    }),
  );

  return (
    <>
      <div className="-mt-2 mb-4 text-right text-sm text-stone-500 dark:text-slate-400">
        全 {total} 件
      </div>
      {items.length === 0 ? (
        <p className="rounded-xl border border-stone-200 bg-white p-8 text-center text-stone-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
          請求書がありません。
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map(({ meta, customerName }) => (
            <InvoiceCard key={meta.id || meta.title} meta={meta} customerName={customerName} />
          ))}
        </ul>
      )}
      <Pagination current={pageNum} totalPages={totalPages} />
    </>
  );
}

function InvoiceListSkeleton() {
  return (
    <ul className="flex flex-col gap-3">
      {["a", "b", "c", "d", "e", "f"].map((k) => (
        <li
          key={k}
          className="rounded-xl border border-stone-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="skeleton h-4 w-2/5 rounded" />
              <div className="skeleton h-3 w-1/4 rounded" />
            </div>
            <div className="skeleton h-6 w-20 rounded-full" />
          </div>
        </li>
      ))}
    </ul>
  );
}

export const getConfig = async () => ({ render: "dynamic" as const });
