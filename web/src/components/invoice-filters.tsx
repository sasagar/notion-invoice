"use client";

import { type FormEvent, useEffect, useState } from "react";
import { LuSearch, LuX } from "react-icons/lu";
import { useRouter } from "waku/router/client";
import { INVOICE_STATUSES } from "@/lib/invoice-schema";
import { hasListFilter, type InvoiceListFilter, toListQuery } from "@/lib/invoice-list";

type CustomerOption = { id: string; label: string };

const chip =
  "inline-flex min-h-9 shrink-0 items-center rounded-full border px-3 text-xs font-medium transition";
const chipIdle =
  "border-paper-line bg-white/60 text-stone-600 hover:border-kent-blue-300 hover:text-kent-blue-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300";
const chipOn = "border-kent-blue-500 bg-kent-blue-500 text-white";
const chipAlertOn = "border-shuiro-500 bg-shuiro-500 text-white";

/** 一覧の絞り込み（ステータス・期限超過・顧客・キーワード）。条件は URL のクエリに持つ。 */
export function InvoiceFilters({
  filter,
  customers,
}: {
  filter: InvoiceListFilter;
  customers: CustomerOption[];
}) {
  const router = useRouter();
  const [q, setQ] = useState(filter.q ?? "");
  // 戻る/進むや別の絞り込みリンクで URL が変わったら入力欄も合わせる。
  useEffect(() => setQ(filter.q ?? ""), [filter.q]);

  // 条件を変えたら 1 ページ目に戻す。
  const go = (next: InvoiceListFilter) => {
    void router.push(`/invoice/list/1${toListQuery(next)}`);
  };

  const onSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    go({ ...filter, q: q.trim() || undefined });
  };

  return (
    <div className="mb-4 flex flex-col gap-3">
      {/* ステータス: スマホでは横スクロール */}
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:px-0">
        <button
          type="button"
          onClick={() => go({ ...filter, status: undefined, overdue: undefined })}
          className={`${chip} ${!filter.status && !filter.overdue ? chipOn : chipIdle}`}
        >
          すべて
        </button>
        <button
          type="button"
          onClick={() =>
            go({ ...filter, status: undefined, overdue: !filter.overdue || undefined })
          }
          className={`${chip} ${filter.overdue ? chipAlertOn : chipIdle}`}
        >
          期限超過
        </button>
        {INVOICE_STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() =>
              go({ ...filter, overdue: undefined, status: filter.status === s ? undefined : s })
            }
            className={`${chip} ${filter.status === s ? chipOn : chipIdle}`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <form onSubmit={onSearch} className="relative flex-1" role="search">
          <LuSearch
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-stone-400"
          />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="件名・番号・顧客名で検索"
            aria-label="キーワード検索"
            enterKeyHint="search"
            className="min-h-11 w-full rounded-md border border-paper-line bg-white/70 pr-3 pl-9 text-sm outline-none transition focus:border-kent-blue-400 dark:border-slate-700 dark:bg-slate-900/40"
          />
        </form>
        <select
          value={filter.customerId ?? ""}
          onChange={(e) => go({ ...filter, customerId: e.target.value || undefined })}
          aria-label="顧客で絞り込み"
          className="select-ledger min-h-11 rounded-md border border-paper-line bg-white/70 pl-3 text-sm outline-none focus:border-kent-blue-400 sm:w-56 dark:border-slate-700 dark:bg-slate-900/40"
        >
          <option value="">すべての顧客</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
        {hasListFilter(filter) && (
          <button
            type="button"
            onClick={() => go({})}
            className="inline-flex min-h-11 items-center justify-center gap-1 rounded-md px-3 text-sm text-stone-500 transition hover:text-kent-blue-600 dark:text-slate-400"
          >
            <LuX aria-hidden />
            条件をクリア
          </button>
        )}
      </div>
    </div>
  );
}
