import { formatYen } from "@/lib/format";
import type { InvoiceTotals } from "@/lib/money/sanitizer";

export function WithholdingTable({ totals }: { totals: InvoiceTotals }) {
  if (totals.withholding === 0) {
    return null;
  }
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-stone-500 dark:text-slate-400">
          <th className="py-1 text-left font-normal">源泉徴収</th>
          <th className="py-1 text-right font-normal">税額</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="py-1">源泉徴収税（10.21%）</td>
          <td className="py-1 text-right">{formatYen(totals.withholding)}</td>
        </tr>
      </tbody>
    </table>
  );
}
