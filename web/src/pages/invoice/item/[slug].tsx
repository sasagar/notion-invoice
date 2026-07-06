import { Suspense } from "react";
import { Card, SectionHeading } from "@/components/card";
import { ErrorState } from "@/components/data-states";
import { PdfDownload } from "@/components/pdf-download";
import { StatusStamp } from "@/components/status-stamp";
import { TaxTable } from "@/components/tax-table";
import { WithholdingTable } from "@/components/withholding-table";
import { getFullInvoice } from "@/lib/data/backend";
import { formatDate, formatDateTime, formatYen } from "@/lib/format";
import { roundAmount } from "@/lib/money/sanitizer";
import type { FullInvoice } from "@/lib/notion/types";
import { requireSession } from "@/lib/session";

export default function InvoiceDetailPage({ slug }: { slug: string }) {
  return (
    <Suspense fallback={<InvoiceDetailSkeleton />}>
      <InvoiceDetailBody slug={slug} />
    </Suspense>
  );
}

async function InvoiceDetailBody({ slug }: { slug: string }) {
  const session = await requireSession();
  const userId = session.user.id;

  let full: FullInvoice | null;
  try {
    full = await getFullInvoice(userId, slug);
  } catch (e) {
    return <ErrorState message={e instanceof Error ? e.message : "取得に失敗しました"} />;
  }
  if (!full) {
    return <ErrorState message={`請求書 #${slug} が見つかりませんでした。`} />;
  }

  const { invoice, customer, account } = full;
  const { meta, rows, totals } = invoice;
  const incl = meta.taxIncluded;

  return (
    <div className="flex flex-col gap-5">
      {/* 台帳の見出し：請求書番号・状態・日付と御請求額を同じ帯で示す */}
      <section className="rounded-lg border border-paper-line bg-white/70 p-6 dark:border-slate-800 dark:bg-slate-900/40 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono text-xs text-stone-400 dark:text-slate-500">
                #{meta.id}
              </span>
              <StatusStamp status={meta.status} />
            </div>
            <h1 className="mt-2 font-display text-2xl font-bold leading-tight text-stone-800 dark:text-slate-100 sm:text-3xl">
              {meta.title || "(件名なし)"}
            </h1>
            <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1 font-mono text-xs text-stone-400 dark:text-slate-500">
              {meta.publishedAt && (
                <div className="flex gap-1.5">
                  <dt>発行日</dt>
                  <dd className="text-stone-600 dark:text-slate-300">
                    {formatDate(meta.publishedAt)}
                  </dd>
                </div>
              )}
              {meta.dueTo && (
                <div className="flex gap-1.5">
                  <dt>支払期限</dt>
                  <dd className="text-stone-600 dark:text-slate-300">{formatDate(meta.dueTo)}</dd>
                </div>
              )}
              <div className="flex gap-1.5">
                <dt>最終更新</dt>
                <dd className="text-stone-600 dark:text-slate-300">
                  {formatDateTime(meta.updatedAt)}
                </dd>
              </div>
            </dl>
          </div>
          <div className="shrink-0 border-t border-paper-line pt-4 dark:border-slate-800 sm:border-t-0 sm:border-l sm:pl-8 sm:pt-0 sm:text-right">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-stone-400 dark:text-slate-500">
              御請求額
            </p>
            <p className="mt-1 font-display text-4xl font-bold tabular-nums text-kent-blue-500 dark:text-kent-blue-200 sm:text-5xl">
              {formatYen(totals.invoiceSum)}
            </p>
          </div>
        </div>
        <div className="mt-6 border-t border-paper-line pt-5 dark:border-slate-800">
          <PdfDownload number={meta.id} customer={customer} account={account} />
        </div>
      </section>

      {/* 請求先 / 自社 */}
      <div className="grid gap-4 sm:grid-cols-2">
        {customer && (
          <Card>
            <SectionHeading>請求先</SectionHeading>
            <p className="font-medium">
              {customer.companyName || customer.name} {customer.honorific}
            </p>
            {customer.companyInfo && (
              <p className="mt-1 whitespace-pre-wrap text-sm text-stone-500 dark:text-slate-400">
                {customer.companyInfo}
              </p>
            )}
            {customer.contactName && (
              <p className="mt-1 text-sm text-stone-500 dark:text-slate-400">
                担当: {customer.contactName}
              </p>
            )}
          </Card>
        )}
        {account && (
          <Card>
            <SectionHeading>自社情報</SectionHeading>
            <div className="flex items-start justify-between gap-3">
              <p className="font-medium">{account.companyName}</p>
              {account.sealImageUrl && (
                <img
                  src={account.sealImageUrl}
                  alt="印影"
                  className="h-16 w-16 shrink-0 object-contain"
                />
              )}
            </div>
            {account.companyInfo && (
              <p className="mt-1 whitespace-pre-wrap text-sm text-stone-500 dark:text-slate-400">
                {account.companyInfo}
              </p>
            )}
            {account.registrationNumber && (
              <p className="mt-1 text-sm text-stone-500 dark:text-slate-400">
                登録番号: {account.registrationNumber}
              </p>
            )}
            {account.bankInfo && (
              <p className="mt-1 whitespace-pre-wrap text-sm text-stone-500 dark:text-slate-400">
                {account.bankInfo}
              </p>
            )}
          </Card>
        )}
      </div>

      {/* 明細 */}
      <Card className="overflow-hidden p-0">
        <div className="px-5 pt-5">
          <SectionHeading>請求明細</SectionHeading>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-paper-line text-xs uppercase tracking-wider text-stone-400 dark:border-slate-800 dark:text-slate-500">
              <tr>
                <th className="p-3 text-left font-medium">表示名</th>
                <th className="p-3 text-left text-[10px] font-medium">項目名</th>
                <th className="p-3 text-right font-medium">単価{incl ? "(税込)" : ""}</th>
                <th className="p-3 text-right font-medium">数量</th>
                <th className="p-3 text-right font-medium">小計{incl ? "(税込)" : ""}</th>
                <th className="p-3 text-center font-medium">税率</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-paper-line/60 dark:border-slate-800/60">
                  <td className="p-3 font-sans">{r.name}</td>
                  <td className="p-3 font-sans text-xs text-stone-400 dark:text-slate-500">
                    {r.itemNames.map((n, i) => (
                      <span key={i} className="block">
                        {n}
                      </span>
                    ))}
                  </td>
                  <td className="p-3 text-right tabular-nums">{formatYen(r.unitPrice)}</td>
                  <td className="p-3 text-right tabular-nums">
                    {r.quantity.toLocaleString()} <span className="font-sans">{r.unit}</span>
                  </td>
                  <td className="p-3 text-right tabular-nums">
                    {formatYen(roundAmount(r.amounts.subtotal))}
                  </td>
                  <td className="p-3 text-center font-sans">{r.taxRate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 内訳 */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-4">
          {totals.tax !== 0 && (
            <Card>
              <SectionHeading>消費税</SectionHeading>
              <TaxTable totals={totals} taxIncluded={incl} />
            </Card>
          )}
          {totals.withholding !== 0 && (
            <Card>
              <SectionHeading>源泉徴収</SectionHeading>
              <WithholdingTable totals={totals} />
            </Card>
          )}
        </div>

        <Card className="self-start">
          <SectionHeading>請求額の内訳</SectionHeading>
          <dl className="flex flex-col gap-2 font-mono text-sm">
            <div className="flex justify-between">
              <dt className="font-sans text-stone-500 dark:text-slate-400">請求額</dt>
              <dd className="tabular-nums">{formatYen(totals.sum)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-sans text-stone-500 dark:text-slate-400">
                消費税{incl ? "(内税額)" : ""}
              </dt>
              <dd className="tabular-nums">
                {incl ? `(${formatYen(totals.tax)})` : formatYen(totals.tax)}
              </dd>
            </div>
            {totals.withholding !== 0 && (
              <div className="flex justify-between">
                <dt className="font-sans text-stone-500 dark:text-slate-400">源泉徴収</dt>
                <dd className="tabular-nums">{formatYen(totals.withholding)}</dd>
              </div>
            )}
            <div className="ledger-total-rule mt-1 flex items-baseline justify-between border-t border-paper-line pb-2 pt-3 dark:border-slate-700">
              <dt className="font-sans text-sm font-semibold text-stone-700 dark:text-slate-200">
                御請求額合計
              </dt>
              <dd className="font-display text-xl font-bold tabular-nums text-kent-blue-600 dark:text-kent-blue-200">
                {formatYen(totals.invoiceSum)}
              </dd>
            </div>
          </dl>
        </Card>
      </div>

      {/* 備考 */}
      {meta.note && (
        <Card>
          <SectionHeading>備考</SectionHeading>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-stone-600 dark:text-slate-300">
            {meta.note}
          </p>
        </Card>
      )}
    </div>
  );
}

function InvoiceDetailSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-lg border border-paper-line bg-white/70 p-6 dark:border-slate-800 dark:bg-slate-900/40 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 flex-1 space-y-3">
            <div className="skeleton h-5 w-24 rounded-[2px]" />
            <div className="skeleton h-8 w-2/3 rounded" />
            <div className="skeleton h-4 w-1/2 rounded" />
          </div>
          <div className="space-y-2 sm:text-right">
            <div className="skeleton ml-auto h-3 w-20 rounded" />
            <div className="skeleton ml-auto h-10 w-40 rounded" />
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        {["customer", "account"].map((k) => (
          <Card key={k}>
            <div className="skeleton h-3 w-16 rounded" />
            <div className="skeleton mt-3 h-4 w-1/2 rounded" />
            <div className="skeleton mt-2 h-3 w-3/4 rounded" />
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden p-0">
        <div className="px-5 pt-5">
          <div className="skeleton h-3 w-20 rounded" />
        </div>
        <div className="flex flex-col gap-3 p-5">
          {["a", "b", "c"].map((k) => (
            <div key={k} className="skeleton h-8 w-full rounded" />
          ))}
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="skeleton h-32 rounded-lg" />
        <div className="skeleton h-32 rounded-lg" />
      </div>
    </div>
  );
}

export const getConfig = async () => ({ render: "dynamic" as const });
