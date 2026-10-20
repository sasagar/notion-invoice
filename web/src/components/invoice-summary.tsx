import { Link } from "waku";
import type { Unstable_RouteHref as RouteHref } from "waku/router/client-core";
import { formatYen } from "@/lib/format";
import { AWAITING_PAYMENT_STATUS, type InvoiceListSummary } from "@/lib/invoice-list";

type Tile = {
  label: string;
  count: number;
  amount: number;
  to: RouteHref;
  alert?: boolean;
};

/** 一覧上部の集計（入金待ち・期限超過・今月の発行額）。タイルを押すとその条件で絞り込む。 */
export function InvoiceSummary({ summary }: { summary: InvoiceListSummary }) {
  const tiles: Tile[] = [
    {
      label: "入金待ち",
      ...summary.awaiting,
      to: `/invoice/list/1?status=${encodeURIComponent(AWAITING_PAYMENT_STATUS)}`,
    },
    {
      label: "うち期限超過",
      ...summary.overdue,
      to: "/invoice/list/1?overdue=1",
      alert: summary.overdue.count > 0,
    },
    { label: "今月の発行", ...summary.issuedThisMonth, to: "/invoice/list/1" },
  ];
  return (
    <div className="mb-5 grid grid-cols-3 gap-2 sm:gap-4">
      {tiles.map((t) => (
        <Link
          key={t.label}
          to={t.to}
          className={`rounded-lg border bg-white/70 p-3 transition hover:border-kent-blue-400 sm:p-4 dark:bg-slate-900/40 ${
            t.alert
              ? "border-shuiro-300 dark:border-shuiro-700"
              : "border-paper-line dark:border-slate-800"
          }`}
        >
          <p
            className={`text-[11px] font-bold tracking-wider sm:text-xs ${
              t.alert
                ? "text-shuiro-600 dark:text-shuiro-400"
                : "text-stone-500 dark:text-slate-400"
            }`}
          >
            {t.label}
          </p>
          <p className="mt-1 truncate font-display text-base font-bold tabular-nums text-stone-800 sm:text-2xl dark:text-slate-100">
            {formatYen(t.amount)}
          </p>
          <p className="font-mono text-[11px] text-stone-400 dark:text-slate-500">{t.count} 件</p>
        </Link>
      ))}
    </div>
  );
}
