"use client";

import { type FormEvent, useRef, useState } from "react";
import { useRouter } from "waku/router/client";
import { Card, SectionHeading } from "@/components/card";
import { TaxTable } from "@/components/tax-table";
import { WithholdingTable } from "@/components/withholding-table";
import { formatYen } from "@/lib/format";
import {
  firstInvoiceIssue,
  INVOICE_STATUSES,
  invoiceSchema,
  TAX_RATES,
  UNITS,
} from "@/lib/invoice-schema";
import { deriveLineAmounts } from "@/lib/money/line-amounts";
import { computeTotals } from "@/lib/money/sanitizer";
import type { InvoiceEditorData } from "@/lib/repository";

type Option = { id: string; label: string };
type ItemOption = { id: string; name: string; unitPrice: number };

/** 明細行の編集状態（数値は入力途中を許すため文字列で保持）。 */
type RowState = {
  key: string;
  itemId: string; // "" = 自由入力
  itemNames: string[]; // 項目名スナップショット
  name: string;
  unitPrice: string;
  quantity: string;
  unit: string;
  taxRate: string;
};

const inputClass =
  "w-full border-b-2 border-paper-line bg-transparent px-0.5 py-1.5 outline-none transition focus:border-kent-blue-500 dark:border-slate-700 dark:focus:border-kent-blue-300";
const labelClass =
  "flex flex-col gap-1 text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-slate-400";
const primaryBtn =
  "rounded-sm bg-kent-blue-500 px-5 py-2 text-white transition hover:bg-kent-blue-600 disabled:opacity-50";
const subtleBtn =
  "rounded-sm border border-paper-line px-3 py-1.5 text-sm text-stone-600 transition hover:border-kent-blue-400 hover:text-kent-blue-600 disabled:opacity-40 dark:border-slate-700 dark:text-slate-300";

function blankRow(key: string): RowState {
  return {
    key,
    itemId: "",
    itemNames: [],
    name: "",
    unitPrice: "0",
    quantity: "1",
    unit: "式",
    taxRate: "10%",
  };
}

function toRowState(r: InvoiceEditorData["rows"][number], key: string): RowState {
  return {
    key,
    itemId: r.itemIds[0] ?? "",
    itemNames: r.itemNames,
    name: r.name,
    unitPrice: String(r.unitPrice),
    quantity: String(r.quantity),
    unit: r.unit,
    taxRate: r.taxRate || "10%",
  };
}

export function InvoiceEditor({
  initial,
  customers,
  accounts,
  items,
}: {
  initial: InvoiceEditorData | null;
  customers: Option[];
  accounts: Option[];
  items: ItemOption[];
}) {
  const router = useRouter();
  const editing = initial !== null;

  const [invoiceNumber, setInvoiceNumber] = useState(initial?.invoiceNumber ?? "");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [status, setStatus] = useState(initial?.status ?? "ドラフト");
  const [customerId, setCustomerId] = useState(initial?.customerId ?? "");
  const [accountId, setAccountId] = useState(initial?.accountId ?? "");
  const [publishedAt, setPublishedAt] = useState(initial?.publishedAt ?? "");
  const [dueTo, setDueTo] = useState(initial?.dueTo ?? "");
  const [taxIncluded, setTaxIncluded] = useState(initial?.taxIncluded ?? false);
  const [withholdingExempt, setWithholdingExempt] = useState(initial?.withholdingExempt ?? false);
  const [note, setNote] = useState(initial?.note ?? "");
  const [memo, setMemo] = useState(initial?.memo ?? "");

  const [rows, setRows] = useState<RowState[]>(() =>
    initial ? initial.rows.map((r, i) => toRowState(r, `r${i}`)) : [blankRow("r0")],
  );
  const keyCounter = useRef(initial ? initial.rows.length : 1);
  const nextKey = () => {
    const k = `r${keyCounter.current}`;
    keyCounter.current += 1;
    return k;
  };

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // ライブ合計（純粋関数をクライアントで実行）。
  const lineAmounts = rows.map((r) =>
    deriveLineAmounts(Number(r.unitPrice) || 0, Number(r.quantity) || 0, r.taxRate),
  );
  const totals = computeTotals({ rows: lineAmounts, taxIncluded, withholdingExempt });

  const patchRow = (key: string, patch: Partial<RowState>) => {
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  };

  const onSelectItem = (key: string, itemId: string) => {
    if (itemId === "") {
      // 自由入力: 表示名・単価は据え置き、由来だけ解除
      patchRow(key, { itemId: "", itemNames: [] });
      return;
    }
    const item = items.find((it) => it.id === itemId);
    if (!item) {
      patchRow(key, { itemId });
      return;
    }
    // 単価スナップショット + 項目名を自動入力（この後、手動で上書き可）
    patchRow(key, {
      itemId,
      itemNames: [item.name],
      name: item.name,
      unitPrice: String(item.unitPrice),
    });
  };

  const addRow = () => setRows((rs) => [...rs, blankRow(nextKey())]);
  const removeRow = (key: string) => setRows((rs) => rs.filter((r) => r.key !== key));
  const moveRow = (index: number, dir: -1 | 1) => {
    setRows((rs) => {
      const j = index + dir;
      if (j < 0 || j >= rs.length) {
        return rs;
      }
      const copy = [...rs];
      const a = copy[index];
      const b = copy[j];
      if (a === undefined || b === undefined) {
        return rs;
      }
      copy[index] = b;
      copy[j] = a;
      return copy;
    });
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const payload = {
      invoiceNumber,
      title,
      status,
      customerId: customerId || null,
      accountId: accountId || null,
      publishedAt: publishedAt || null,
      dueTo: dueTo || null,
      taxIncluded,
      withholdingExempt,
      note,
      memo,
      rows: rows.map((r) => ({
        name: r.name,
        itemNames: r.itemNames,
        unitPrice: r.unitPrice,
        quantity: r.quantity,
        unit: r.unit,
        taxRate: r.taxRate,
        itemIds: r.itemId ? [r.itemId] : [],
      })),
    };
    const parsed = invoiceSchema.safeParse(payload);
    if (!parsed.success) {
      setBusy(false);
      setError(firstInvoiceIssue(parsed.error));
      return;
    }
    const url = editing ? `/api/invoices/${initial.id}` : "/api/invoices";
    const res = await fetch(url, {
      method: editing ? "PUT" : "POST",
      headers: { "content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify(parsed.data),
    });
    setBusy(false);
    if (!res.ok) {
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      setError(j.error ?? "保存に失敗しました");
      return;
    }
    const j = (await res.json()) as { invoiceNumber?: string };
    router.push(`/invoice/item/${j.invoiceNumber ?? invoiceNumber}`);
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      {error && (
        <p className="rounded-sm bg-shuiro-50 px-3 py-2 text-sm text-shuiro-700 dark:bg-shuiro-950/30 dark:text-shuiro-300">
          {error}
        </p>
      )}

      {/* ヘッダ */}
      <Card>
        <SectionHeading>請求書</SectionHeading>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={labelClass}>
            請求書番号
            <input
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              required
              className={inputClass}
            />
          </label>
          <label className={labelClass}>
            件名
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputClass}
            />
          </label>
          <label className={labelClass}>
            ステータス
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={inputClass}
            >
              {INVOICE_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className={labelClass}>
              発行日
              <input
                type="date"
                value={publishedAt}
                onChange={(e) => setPublishedAt(e.target.value)}
                className={inputClass}
              />
            </label>
            <label className={labelClass}>
              支払期限
              <input
                type="date"
                value={dueTo}
                onChange={(e) => setDueTo(e.target.value)}
                className={inputClass}
              />
            </label>
          </div>
          <label className={labelClass}>
            請求先（顧客）
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className={inputClass}
            >
              <option value="">（未選択）</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            自社
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className={inputClass}
            >
              <option value="">（未選択）</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.label}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-end gap-6 sm:col-span-2">
            <label className="flex items-center gap-2 text-sm text-stone-600 dark:text-slate-300">
              <input
                type="checkbox"
                checked={taxIncluded}
                onChange={(e) => setTaxIncluded(e.target.checked)}
              />
              内税
            </label>
            <label className="flex items-center gap-2 text-sm text-stone-600 dark:text-slate-300">
              <input
                type="checkbox"
                checked={withholdingExempt}
                onChange={(e) => setWithholdingExempt(e.target.checked)}
              />
              源泉徴収非対象
            </label>
          </div>
          <label className={`${labelClass} sm:col-span-2`}>
            備考（請求書に記載されます）
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className={`${inputClass} resize-y`}
            />
          </label>
          <label className={`${labelClass} sm:col-span-2`}>
            メモ（内部用・請求書には載りません）
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              rows={2}
              className={`${inputClass} resize-y`}
            />
          </label>
        </div>
      </Card>

      {/* 明細 */}
      <Card className="overflow-hidden p-0">
        <div className="flex items-center justify-between px-5 pt-5">
          <SectionHeading>明細</SectionHeading>
          <button type="button" onClick={addRow} className={subtleBtn}>
            + 行を追加
          </button>
        </div>
        <datalist id="unit-options">
          {UNITS.map((u) => (
            <option key={u} value={u} />
          ))}
        </datalist>
        <div className="overflow-x-auto px-5 pb-5">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="border-b border-paper-line text-xs uppercase tracking-wider text-stone-400 dark:border-slate-800 dark:text-slate-500">
              <tr>
                <th className="w-8 py-2" />
                <th className="py-2 text-left font-medium">項目マスタ</th>
                <th className="py-2 text-left font-medium">表示名</th>
                <th className="py-2 text-right font-medium">単価</th>
                <th className="py-2 text-right font-medium">数量</th>
                <th className="py-2 text-left font-medium">単位</th>
                <th className="py-2 text-center font-medium">税率</th>
                <th className="w-8 py-2" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r, index) => (
                <tr key={r.key} className="border-b border-paper-line/60 dark:border-slate-800/60">
                  <td className="py-2 pr-1 align-middle">
                    <div className="flex flex-col">
                      <button
                        type="button"
                        onClick={() => moveRow(index, -1)}
                        disabled={index === 0}
                        className="text-stone-400 hover:text-kent-blue-500 disabled:opacity-30"
                        aria-label="上へ"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        onClick={() => moveRow(index, 1)}
                        disabled={index === rows.length - 1}
                        className="text-stone-400 hover:text-kent-blue-500 disabled:opacity-30"
                        aria-label="下へ"
                      >
                        ▼
                      </button>
                    </div>
                  </td>
                  <td className="py-2 pr-2">
                    <select
                      value={r.itemId}
                      onChange={(e) => onSelectItem(r.key, e.target.value)}
                      className={`${inputClass} min-w-[7rem]`}
                    >
                      <option value="">（自由入力）</option>
                      {items.map((it) => (
                        <option key={it.id} value={it.id}>
                          {it.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2 pr-2">
                    <input
                      value={r.name}
                      onChange={(e) => patchRow(r.key, { name: e.target.value })}
                      className={`${inputClass} min-w-[8rem]`}
                    />
                  </td>
                  <td className="py-2 pr-2">
                    <input
                      type="number"
                      step="any"
                      value={r.unitPrice}
                      onChange={(e) => patchRow(r.key, { unitPrice: e.target.value })}
                      className={`${inputClass} w-24 text-right`}
                    />
                  </td>
                  <td className="py-2 pr-2">
                    <input
                      type="number"
                      step="any"
                      value={r.quantity}
                      onChange={(e) => patchRow(r.key, { quantity: e.target.value })}
                      className={`${inputClass} w-20 text-right`}
                    />
                  </td>
                  <td className="py-2 pr-2">
                    <input
                      list="unit-options"
                      value={r.unit}
                      onChange={(e) => patchRow(r.key, { unit: e.target.value })}
                      className={`${inputClass} w-20`}
                    />
                  </td>
                  <td className="py-2 pr-2">
                    <select
                      value={r.taxRate}
                      onChange={(e) => patchRow(r.key, { taxRate: e.target.value })}
                      className={inputClass}
                    >
                      {TAX_RATES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2 text-right align-middle">
                    <button
                      type="button"
                      onClick={() => removeRow(r.key)}
                      className="text-shuiro-500 hover:text-shuiro-600 dark:text-shuiro-400"
                      aria-label="行を削除"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-4 text-center text-stone-400 dark:text-slate-500">
                    明細行がありません。「行を追加」で追加してください。
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ライブ合計 */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-4">
          {totals.tax !== 0 && (
            <Card>
              <SectionHeading>消費税</SectionHeading>
              <TaxTable totals={totals} taxIncluded={taxIncluded} />
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
          <SectionHeading>御請求額（プレビュー）</SectionHeading>
          <dl className="flex flex-col gap-2 font-mono text-sm">
            <div className="flex justify-between">
              <dt className="font-sans text-stone-500 dark:text-slate-400">請求額</dt>
              <dd className="tabular-nums">{formatYen(totals.sum)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-sans text-stone-500 dark:text-slate-400">
                消費税{taxIncluded ? "(内税額)" : ""}
              </dt>
              <dd className="tabular-nums">
                {taxIncluded ? `(${formatYen(totals.tax)})` : formatYen(totals.tax)}
              </dd>
            </div>
            {totals.withholding !== 0 && (
              <div className="flex justify-between">
                <dt className="font-sans text-stone-500 dark:text-slate-400">源泉徴収</dt>
                <dd className="tabular-nums">{formatYen(totals.withholding)}</dd>
              </div>
            )}
            <div className="mt-1 flex items-baseline justify-between border-t border-paper-line pt-3 dark:border-slate-700">
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

      <div className="flex items-center gap-3">
        <button type="submit" disabled={busy} className={primaryBtn}>
          {busy ? "保存中…" : editing ? "保存" : "作成"}
        </button>
        <button
          type="button"
          onClick={() =>
            router.push(editing ? `/invoice/item/${initial.invoiceNumber}` : "/invoice/list/1")
          }
          className={subtleBtn}
        >
          キャンセル
        </button>
      </div>
    </form>
  );
}
