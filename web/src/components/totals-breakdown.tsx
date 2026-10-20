import { TaxTable } from "@/components/tax-table";
import { WithholdingTable } from "@/components/withholding-table";
import { formatYen } from "@/lib/format";
import type { InvoiceTotals } from "@/lib/money/sanitizer";

const subHeading =
  "mt-5 mb-1 text-[11px] font-bold tracking-[0.15em] text-stone-400 dark:text-slate-500";

/**
 * 御請求額の内訳（小計・消費税・源泉徴収 → 合計）と、税率別・源泉徴収の明細表。
 * 詳細画面と編集画面のサイドバーで共通に使う。
 */
export function TotalsBreakdown({
  totals,
  taxIncluded,
}: {
  totals: InvoiceTotals;
  taxIncluded: boolean;
}) {
  return (
    <>
      <dl className="flex flex-col gap-2 font-mono text-sm">
        <div className="flex justify-between gap-3">
          <dt className="font-sans text-stone-500 dark:text-slate-400">
            小計（{taxIncluded ? "税込" : "税抜"}）
          </dt>
          <dd className="tabular-nums">{formatYen(totals.sum)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="font-sans text-stone-500 dark:text-slate-400">
            消費税{taxIncluded ? "（内税額）" : ""}
          </dt>
          <dd className="tabular-nums">
            {taxIncluded ? `(${formatYen(totals.tax)})` : formatYen(totals.tax)}
          </dd>
        </div>
        {totals.withholding !== 0 && (
          <div className="flex justify-between gap-3">
            <dt className="font-sans text-stone-500 dark:text-slate-400">源泉徴収</dt>
            <dd className="tabular-nums">{formatYen(totals.withholding)}</dd>
          </div>
        )}
        <div className="ledger-total-rule mt-1 flex items-baseline justify-between gap-3 border-t border-paper-line pt-3 pb-2 dark:border-slate-700">
          <dt className="font-sans text-sm font-semibold text-stone-700 dark:text-slate-200">
            御請求額合計
          </dt>
          <dd className="font-display text-xl font-bold tabular-nums text-kent-blue-600 dark:text-kent-blue-200">
            {formatYen(totals.invoiceSum)}
          </dd>
        </div>
      </dl>
      {totals.tax !== 0 && (
        <>
          <p className={subHeading}>税率ごとの消費税</p>
          <TaxTable totals={totals} taxIncluded={taxIncluded} />
        </>
      )}
      {totals.withholding !== 0 && (
        <>
          <p className={subHeading}>源泉徴収</p>
          <WithholdingTable totals={totals} />
        </>
      )}
    </>
  );
}
