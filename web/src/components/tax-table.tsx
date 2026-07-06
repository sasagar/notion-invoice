import { formatYen } from "@/lib/format";
import type { InvoiceTotals } from "@/lib/money/sanitizer";

export function TaxTable({ totals, taxIncluded }: { totals: InvoiceTotals; taxIncluded: boolean }) {
  const rows: { label: string; base: number; tax: number }[] = [];
  if (totals.sum10 !== 0) {
    rows.push({ label: "消費税（10%）", base: totals.sum10, tax: totals.tax10 });
  }
  if (totals.sum8 !== 0) {
    rows.push({ label: "消費税（8%）", base: totals.sum8, tax: totals.tax8 });
  }
  if (rows.length === 0) {
    return null;
  }
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-paper-line text-xs uppercase tracking-wider text-stone-400 dark:border-slate-800 dark:text-slate-500">
          <th className="py-1.5 text-left font-medium">対象</th>
          <th className="py-1.5 text-right font-medium">対象額</th>
          <th className="py-1.5 text-right font-medium">{taxIncluded ? "内税額" : "税額"}</th>
        </tr>
      </thead>
      <tbody className="font-mono">
        {rows.map((r) => (
          <tr
            key={r.label}
            className="border-b border-paper-line/60 last:border-0 dark:border-slate-800/60"
          >
            <td className="py-1.5 font-sans">{r.label}</td>
            <td className="py-1.5 text-right tabular-nums">{formatYen(r.base)}</td>
            <td className="py-1.5 text-right tabular-nums">
              {taxIncluded ? `(${formatYen(r.tax)})` : formatYen(r.tax)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
