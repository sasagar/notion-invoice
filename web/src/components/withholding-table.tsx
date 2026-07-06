import { formatYen } from "@/lib/format";
import type { InvoiceTotals } from "@/lib/money/sanitizer";

export function WithholdingTable({ totals }: { totals: InvoiceTotals }) {
  if (totals.withholding === 0) {
    return null;
  }
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-paper-line text-xs uppercase tracking-wider text-stone-400 dark:border-slate-800 dark:text-slate-500">
          <th className="py-1.5 text-left font-medium">源泉徴収</th>
          <th className="py-1.5 text-right font-medium">税額</th>
        </tr>
      </thead>
      <tbody className="font-mono">
        <tr>
          <td className="py-1.5 font-sans">源泉徴収税（10.21%）</td>
          <td className="py-1.5 text-right tabular-nums">{formatYen(totals.withholding)}</td>
        </tr>
      </tbody>
    </table>
  );
}
