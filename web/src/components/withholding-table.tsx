import { formatYen } from "@/lib/format";
import { type InvoiceTotals, WITHHOLDING_THRESHOLD, withholdingTax } from "@/lib/money/sanitizer";

export function WithholdingTable({ totals }: { totals: InvoiceTotals }) {
  if (totals.withholding === 0) {
    return null;
  }
  // 100 万円ちょうどの税額を超えていれば、超過分に 20.42% が掛かっている。
  const overThreshold = -totals.withholding > withholdingTax(WITHHOLDING_THRESHOLD);
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
          <td className="py-1.5 font-sans">
            源泉徴収税（10.21%{overThreshold ? "、100万円超の部分は20.42%" : ""}）
          </td>
          <td className="py-1.5 text-right tabular-nums">{formatYen(totals.withholding)}</td>
        </tr>
      </tbody>
    </table>
  );
}
