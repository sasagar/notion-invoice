import { Card, SectionHeading } from "@/components/card";
import { ErrorState } from "@/components/data-states";
import { PdfDownload } from "@/components/pdf-download";
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
    <div className="flex flex-col gap-5">
      {/* ヒーロー：御請求額を最上部に特大表示 */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-kent-blue-500 via-kent-blue-600 to-kent-blue-800 p-6 text-white shadow-lg sm:p-8">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-white/10 blur-2xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-28 -left-16 h-56 w-56 rounded-full bg-kent-blue-300/20 blur-2xl"
        />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium tracking-wider backdrop-blur">
                請求書
              </span>
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
                {meta.status || "—"}
              </span>
            </div>
            <h1 className="mt-3 text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
              {meta.title || "(件名なし)"}
            </h1>
            <p className="mt-2 text-sm text-white/70">
              <span className="font-medium text-white/90">#{meta.id}</span>
              {meta.publishedAt && `　発行日 ${formatDate(meta.publishedAt)}`}
              {meta.dueTo && `　支払期限 ${formatDate(meta.dueTo)}`}
            </p>
          </div>
          <div className="shrink-0 sm:text-right">
            <p className="text-xs uppercase tracking-[0.2em] text-white/60">御請求額</p>
            <p className="mt-1 text-4xl font-black tabular-nums sm:text-5xl">
              {formatYen(totals.invoiceSum)}
            </p>
          </div>
        </div>
        <div className="relative mt-6">
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
            <thead className="bg-stone-50 text-stone-500 dark:bg-slate-800/50 dark:text-slate-400">
              <tr>
                <th className="p-3 text-left font-medium">表示名</th>
                <th className="p-3 text-left font-medium">項目名</th>
                <th className="p-3 text-right font-medium">単価{incl ? "(税込)" : ""}</th>
                <th className="p-3 text-right font-medium">数量</th>
                <th className="p-3 text-right font-medium">小計{incl ? "(税込)" : ""}</th>
                <th className="p-3 text-center font-medium">税率</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-stone-100 dark:border-slate-800">
                  <td className="p-3">{r.name}</td>
                  <td className="p-3 text-stone-500 dark:text-slate-400">
                    {r.itemNames.map((n, i) => (
                      <span key={i} className="block">
                        {n}
                      </span>
                    ))}
                  </td>
                  <td className="p-3 text-right tabular-nums">{formatYen(r.unitPrice)}</td>
                  <td className="p-3 text-right tabular-nums">
                    {r.quantity.toLocaleString()} {r.unit}
                  </td>
                  <td className="p-3 text-right tabular-nums">
                    {formatYen(roundAmount(r.amounts.subtotal))}
                  </td>
                  <td className="p-3 text-center">{r.taxRate}</td>
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
          <dl className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-stone-500 dark:text-slate-400">請求額</dt>
              <dd className="tabular-nums">{formatYen(totals.sum)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-stone-500 dark:text-slate-400">消費税{incl ? "(内税額)" : ""}</dt>
              <dd className="tabular-nums">
                {incl ? `(${formatYen(totals.tax)})` : formatYen(totals.tax)}
              </dd>
            </div>
            {totals.withholding !== 0 && (
              <div className="flex justify-between">
                <dt className="text-stone-500 dark:text-slate-400">源泉徴収</dt>
                <dd className="tabular-nums">{formatYen(totals.withholding)}</dd>
              </div>
            )}
            <div className="mt-1 flex items-baseline justify-between border-t border-stone-200 pt-3 dark:border-slate-700">
              <dt className="font-semibold">請求額合計</dt>
              <dd className="text-xl font-bold tabular-nums text-kent-blue-500 dark:text-kent-blue-200">
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

export const getConfig = async () => ({ render: "dynamic" as const });
