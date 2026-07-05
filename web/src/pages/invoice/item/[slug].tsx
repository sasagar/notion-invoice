import { ErrorState } from "@/components/data-states";
import { StatusTag } from "@/components/status-tag";
import { TaxTable } from "@/components/tax-table";
import { WithholdingTable } from "@/components/withholding-table";
import { formatDate, formatYen } from "@/lib/format";
import { roundAmount } from "@/lib/money/sanitizer";
import { getInvoiceByNumber, getPage, getRows } from "@/lib/notion/fetchers";
import { buildInvoice, mapAccount, mapCustomer, mapInvoiceMeta } from "@/lib/notion/mapper";
import { requireSession } from "@/lib/session";

export default async function InvoiceDetailPage({ slug }: { slug: string }) {
  const session = await requireSession();
  const userId = session.user.id;

  let rawInvoice: unknown;
  try {
    rawInvoice = await getInvoiceByNumber(userId, slug);
  } catch (e) {
    return <ErrorState message={e instanceof Error ? e.message : "取得に失敗しました"} />;
  }
  if (!rawInvoice) {
    return <ErrorState message={`請求書 #${slug} が見つかりませんでした。`} />;
  }

  const meta0 = mapInvoiceMeta(rawInvoice);
  const [rawRows, rawCustomer, rawAccount] = await Promise.all([
    getRows(userId, meta0.itemRelationIds),
    meta0.customerRelationId ? getPage(userId, meta0.customerRelationId) : Promise.resolve(null),
    meta0.accountRelationId ? getPage(userId, meta0.accountRelationId) : Promise.resolve(null),
  ]);

  const { meta, rows, totals } = buildInvoice(rawInvoice, rawRows);
  const customer = rawCustomer ? mapCustomer(rawCustomer) : null;
  const account = rawAccount ? mapAccount(rawAccount) : null;
  const incl = meta.taxIncluded;

  return (
    <article className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{meta.title || "(件名なし)"}</h1>
          <p className="text-sm text-stone-500 dark:text-slate-400">
            #{meta.id}
            {meta.publishedAt && `　発行日 ${formatDate(meta.publishedAt)}`}
            {meta.dueTo && `　支払期限 ${formatDate(meta.dueTo)}`}
          </p>
        </div>
        <StatusTag status={meta.status} />
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {customer && (
          <section className="rounded-xl border border-stone-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-2 text-sm font-bold text-stone-500 dark:text-slate-400">請求先</h2>
            <p className="font-medium">
              {customer.companyName || customer.name} {customer.honorific}
            </p>
            {customer.companyInfo && (
              <p className="whitespace-pre-wrap text-sm text-stone-500 dark:text-slate-400">
                {customer.companyInfo}
              </p>
            )}
            {customer.contactName && (
              <p className="text-sm text-stone-500 dark:text-slate-400">
                担当: {customer.contactName}
              </p>
            )}
          </section>
        )}
        {account && (
          <section className="rounded-xl border border-stone-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-2 text-sm font-bold text-stone-500 dark:text-slate-400">自社情報</h2>
            <p className="font-medium">{account.companyName}</p>
            {account.companyInfo && (
              <p className="whitespace-pre-wrap text-sm text-stone-500 dark:text-slate-400">
                {account.companyInfo}
              </p>
            )}
            {account.registrationNumber && (
              <p className="text-sm text-stone-500 dark:text-slate-400">
                登録番号: {account.registrationNumber}
              </p>
            )}
            {account.bankInfo && (
              <p className="mt-1 whitespace-pre-wrap text-sm text-stone-500 dark:text-slate-400">
                {account.bankInfo}
              </p>
            )}
          </section>
        )}
      </div>

      <section className="overflow-x-auto rounded-xl border border-stone-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full text-sm">
          <thead className="border-b border-stone-200 text-stone-500 dark:border-slate-800 dark:text-slate-400">
            <tr>
              <th className="p-3 text-left font-normal">表示名</th>
              <th className="p-3 text-left font-normal">項目名</th>
              <th className="p-3 text-right font-normal">単価{incl ? "(税込)" : ""}</th>
              <th className="p-3 text-right font-normal">数量</th>
              <th className="p-3 text-right font-normal">小計{incl ? "(税込)" : ""}</th>
              <th className="p-3 text-center font-normal">税率</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.id}
                className="border-b border-stone-100 last:border-0 dark:border-slate-800"
              >
                <td className="p-3">{r.name}</td>
                <td className="p-3 text-stone-500 dark:text-slate-400">
                  {r.itemNames.map((n, i) => (
                    <span key={i} className="block">
                      {n}
                    </span>
                  ))}
                </td>
                <td className="p-3 text-right">{formatYen(r.unitPrice)}</td>
                <td className="p-3 text-right">
                  {r.quantity.toLocaleString()} {r.unit}
                </td>
                <td className="p-3 text-right">{formatYen(roundAmount(r.amounts.subtotal))}</td>
                <td className="p-3 text-center">{r.taxRate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <TaxTable totals={totals} taxIncluded={incl} />
        <WithholdingTable totals={totals} />
      </div>

      <section className="ml-auto w-full max-w-sm rounded-xl border border-stone-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <dl className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between">
            <dt>請求額</dt>
            <dd>{formatYen(totals.sum)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>消費税{incl ? "(内税額)" : ""}</dt>
            <dd>{incl ? `(${formatYen(totals.tax)})` : formatYen(totals.tax)}</dd>
          </div>
          {totals.withholding !== 0 && (
            <div className="flex justify-between">
              <dt>源泉徴収</dt>
              <dd>{formatYen(totals.withholding)}</dd>
            </div>
          )}
          <div className="mt-2 flex justify-between border-t border-stone-200 pt-2 text-lg font-bold dark:border-slate-700">
            <dt>請求額合計</dt>
            <dd>{formatYen(totals.invoiceSum)}</dd>
          </div>
        </dl>
      </section>

      {meta.note && (
        <section>
          <h2 className="mb-1 text-sm font-bold text-stone-500 dark:text-slate-400">備考</h2>
          <p className="whitespace-pre-wrap text-sm">{meta.note}</p>
        </section>
      )}
    </article>
  );
}

export const getConfig = async () => ({ render: "dynamic" as const });
