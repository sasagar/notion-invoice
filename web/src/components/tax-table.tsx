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
        <tr className="text-stone-500 dark:text-slate-400">
          <th className="py-1 text-left font-normal">対象</th>
          <th className="py-1 text-right font-normal">対象額</th>
          <th className="py-1 text-right font-normal">{taxIncluded ? "内税額" : "税額"}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.label}>
            <td className="py-1">{r.label}</td>
            <td className="py-1 text-right">{formatYen(r.base)}</td>
            <td className="py-1 text-right">
              {taxIncluded ? `(${formatYen(r.tax)})` : formatYen(r.tax)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
