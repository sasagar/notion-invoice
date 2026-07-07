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
  ROUNDING_LABELS,
  ROUNDING_MODES,
  TAX_RATES,
  UNITS,
} from "@/lib/invoice-schema";
import { firstIssue, itemSchema } from "@/lib/master-schemas";
import { deriveLineAmounts } from "@/lib/money/line-amounts";
import { computeTotals, roundAmount, type RoundingMode } from "@/lib/money/sanitizer";
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
  unitCustom: boolean; // 単位を直接入力（text input）中か
  taxRate: string;
  rounding: string; // "" = 既定（請求書の丸め）を継承
};

// 単位 select / 項目 select の特殊選択肢（実データと衝突しないトークン）。
const NEW_ITEM = "__new_item__";
const CUSTOM_UNIT = "__custom_unit__";
const UNIT_SET = new Set<string>(UNITS);

const inputClass =
  "min-h-11 w-full border-b-2 border-paper-line bg-transparent px-0.5 py-1.5 outline-none transition focus:border-kent-blue-500 sm:min-h-0 dark:border-slate-700 dark:focus:border-kent-blue-300";
const labelClass =
  "flex flex-col gap-1 text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-slate-400";
const fieldLabelClass =
  "mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-slate-500";
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
    unitCustom: false,
    taxRate: "10%",
    rounding: "",
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
    unitCustom: false, // プリセット外の値は select に動的追加して表示する
    taxRate: r.taxRate || "10%",
    rounding: r.rounding ?? "",
  };
}

export function InvoiceEditor({
  initial,
  customers,
  accounts,
  items: itemsProp,
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
  const [rounding, setRounding] = useState<RoundingMode>(initial?.rounding ?? "round");
  const [note, setNote] = useState(initial?.note ?? "");
  const [memo, setMemo] = useState(initial?.memo ?? "");

  // 項目マスタはインライン追加で増えるため state で持つ。
  const [items, setItems] = useState<ItemOption[]>(itemsProp);

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

  // インライン項目追加フォーム（1 行につき 1 つ）。
  const [addItemFor, setAddItemFor] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [addItemBusy, setAddItemBusy] = useState(false);
  const [addItemError, setAddItemError] = useState("");

  // ライブ合計（純粋関数をクライアントで実行）。行の丸め上書きも反映する。
  const lineRows = rows.map((r) => {
    const a = deriveLineAmounts(Number(r.unitPrice) || 0, Number(r.quantity) || 0, r.taxRate);
    return r.rounding ? { ...a, rounding: r.rounding as RoundingMode } : a;
  });
  const totals = computeTotals({ rows: lineRows, taxIncluded, withholdingExempt, rounding });

  /** 行の小計（有効な丸め適用後）を求める。 */
  const rowSubtotal = (r: RowState): number => {
    const a = deriveLineAmounts(Number(r.unitPrice) || 0, Number(r.quantity) || 0, r.taxRate);
    const eff = (r.rounding || rounding) as RoundingMode;
    return roundAmount(a.subtotal, eff);
  };

  const patchRow = (key: string, patch: Partial<RowState>) => {
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  };

  const onSelectItem = (key: string, value: string) => {
    if (value === NEW_ITEM) {
      // インライン追加フォームを開く（select 自体の値は据え置き）。
      setAddItemFor(key);
      setNewItemName("");
      setNewItemPrice("");
      setAddItemError("");
      return;
    }
    if (value === "") {
      // 自由入力: 表示名・単価は据え置き、由来だけ解除
      patchRow(key, { itemId: "", itemNames: [] });
      return;
    }
    const item = items.find((it) => it.id === value);
    if (!item) {
      patchRow(key, { itemId: value });
      return;
    }
    // 単価スナップショット + 項目名を自動入力（この後、手動で上書き可）
    patchRow(key, {
      itemId: value,
      itemNames: [item.name],
      name: item.name,
      unitPrice: String(item.unitPrice),
    });
  };

  /** インラインフォームから項目マスタを作成し、その行で選択状態にする。 */
  const onCreateItem = async (key: string) => {
    const parsed = itemSchema.safeParse({ name: newItemName, unitPrice: newItemPrice });
    if (!parsed.success) {
      setAddItemError(firstIssue(parsed.error));
      return;
    }
    setAddItemBusy(true);
    setAddItemError("");
    const res = await fetch("/api/items", {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify(parsed.data),
    });
    setAddItemBusy(false);
    const j = (await res.json().catch(() => ({}))) as { id?: string; error?: string };
    if (!res.ok || !j.id) {
      setAddItemError(j.error ?? "項目の追加に失敗しました");
      return;
    }
    const created: ItemOption = {
      id: j.id,
      name: parsed.data.name,
      unitPrice: parsed.data.unitPrice,
    };
    setItems((its) => [...its, created].sort((a, b) => a.name.localeCompare(b.name, "ja")));
    patchRow(key, {
      itemId: created.id,
      itemNames: [created.name],
      name: created.name,
      unitPrice: String(created.unitPrice),
    });
    setAddItemFor(null);
    setNewItemName("");
    setNewItemPrice("");
  };

  const onUnitSelect = (key: string, value: string) => {
    if (value === CUSTOM_UNIT) {
      patchRow(key, { unitCustom: true });
      return;
    }
    patchRow(key, { unit: value, unitCustom: false });
  };

  const addRow = () => setRows((rs) => [...rs, blankRow(nextKey())]);
  const removeRow = (key: string) => {
    setRows((rs) => rs.filter((r) => r.key !== key));
    setAddItemFor((cur) => (cur === key ? null : cur));
  };
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
      rounding,
      note,
      memo,
      rows: rows.map((r) => ({
        name: r.name,
        itemNames: r.itemNames,
        unitPrice: r.unitPrice,
        quantity: r.quantity,
        unit: r.unit,
        taxRate: r.taxRate,
        rounding: r.rounding || null, // "" → null（請求書の既定を継承）
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

  const onCancel = () =>
    router.push(editing ? `/invoice/item/${initial.invoiceNumber}` : "/invoice/list/1");

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      {error && (
        <p className="rounded-sm bg-shuiro-50 px-3 py-2 text-sm text-shuiro-700 dark:bg-shuiro-950/30 dark:text-shuiro-300">
          {error}
        </p>
      )}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        {/* 左: ヘッダ情報 + 明細 */}
        <div className="flex min-w-0 flex-col gap-5">
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
                  className={`${inputClass} select-ledger`}
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
                  className={`${inputClass} select-ledger`}
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
                  className={`${inputClass} select-ledger`}
                >
                  <option value="">（未選択）</option>
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.label}
                    </option>
                  ))}
                </select>
              </label>
              <div className="flex flex-wrap items-end gap-6 sm:col-span-2">
                <label className="flex min-h-11 items-center gap-2 text-sm text-stone-600 sm:min-h-0 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={taxIncluded}
                    onChange={(e) => setTaxIncluded(e.target.checked)}
                  />
                  内税
                </label>
                <label className="flex min-h-11 items-center gap-2 text-sm text-stone-600 sm:min-h-0 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={withholdingExempt}
                    onChange={(e) => setWithholdingExempt(e.target.checked)}
                  />
                  源泉徴収非対象
                </label>
                <label className="flex min-h-11 items-center gap-2 text-sm text-stone-600 sm:min-h-0 dark:text-slate-300">
                  既定の丸め
                  <select
                    value={rounding}
                    onChange={(e) => setRounding(e.target.value as RoundingMode)}
                    className={`${inputClass} select-ledger`}
                  >
                    {ROUNDING_MODES.map((m) => (
                      <option key={m} value={m}>
                        {ROUNDING_LABELS[m]}
                      </option>
                    ))}
                  </select>
                  <span className="text-[10px] font-normal normal-case tracking-normal text-stone-400 dark:text-slate-500">
                    ※各行で上書き可
                  </span>
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
            </div>
          </Card>

          {/* 明細（グリッド行カード） */}
          <Card>
            <div className="mb-3 flex items-center justify-between">
              <SectionHeading>明細</SectionHeading>
              <button type="button" onClick={addRow} className={subtleBtn}>
                + 行を追加
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {rows.map((r, index) => (
                <div
                  key={r.key}
                  className="rounded-md border border-paper-line bg-white/50 p-3 dark:border-slate-800 dark:bg-slate-900/30"
                >
                  {/* 1行目: 項目マスタ + 表示名 */}
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                    <label className="block w-full sm:w-56">
                      <span className={fieldLabelClass}>項目マスタ</span>
                      <select
                        value={r.itemId}
                        onChange={(e) => onSelectItem(r.key, e.target.value)}
                        className={`${inputClass} select-ledger`}
                      >
                        <option value="">（自由入力）</option>
                        {items.map((it) => (
                          <option key={it.id} value={it.id}>
                            {it.name}
                          </option>
                        ))}
                        <option value={NEW_ITEM}>＋ 新しい項目を追加…</option>
                      </select>
                    </label>
                    <label className="block min-w-0 flex-1">
                      <span className={fieldLabelClass}>表示名</span>
                      <input
                        value={r.name}
                        onChange={(e) => patchRow(r.key, { name: e.target.value })}
                        className={inputClass}
                      />
                    </label>
                  </div>

                  {/* インライン項目追加フォーム */}
                  {addItemFor === r.key && (
                    <div className="mt-3 rounded-sm border border-dashed border-kent-blue-300 bg-kent-blue-50/40 p-3 dark:border-kent-blue-800 dark:bg-kent-blue-950/20">
                      <p className="mb-2 text-xs font-bold text-kent-blue-600 dark:text-kent-blue-200">
                        新しい項目マスタを追加
                      </p>
                      {addItemError && (
                        <p className="mb-2 text-xs text-shuiro-600 dark:text-shuiro-400">
                          {addItemError}
                        </p>
                      )}
                      <div className="flex flex-wrap items-end gap-3">
                        <label className="block min-w-0 flex-1">
                          <span className={fieldLabelClass}>項目名</span>
                          <input
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)}
                            className={inputClass}
                          />
                        </label>
                        <label className="block w-32">
                          <span className={fieldLabelClass}>単価(税抜)</span>
                          <input
                            type="number"
                            step="any"
                            inputMode="decimal"
                            value={newItemPrice}
                            onChange={(e) => setNewItemPrice(e.target.value)}
                            placeholder="8000"
                            className={`${inputClass} text-right`}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => onCreateItem(r.key)}
                          disabled={addItemBusy}
                          className="rounded-sm bg-kent-blue-500 px-3 py-1.5 text-sm text-white transition hover:bg-kent-blue-600 disabled:opacity-50"
                        >
                          {addItemBusy ? "追加中…" : "追加"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setAddItemFor(null)}
                          className={subtleBtn}
                        >
                          キャンセル
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 2行目: 単価/数量/単位/税率/丸め/行小計 + 操作 */}
                  <div className="mt-3 flex flex-wrap items-end gap-x-4 gap-y-3">
                    <label className="block w-28">
                      <span className={fieldLabelClass}>単価</span>
                      <input
                        type="number"
                        step="any"
                        inputMode="decimal"
                        value={r.unitPrice}
                        onChange={(e) => patchRow(r.key, { unitPrice: e.target.value })}
                        className={`${inputClass} text-right`}
                      />
                    </label>
                    <label className="block w-20">
                      <span className={fieldLabelClass}>数量</span>
                      <input
                        type="number"
                        step="any"
                        inputMode="decimal"
                        value={r.quantity}
                        onChange={(e) => patchRow(r.key, { quantity: e.target.value })}
                        className={`${inputClass} text-right`}
                      />
                    </label>
                    <div className="w-32">
                      <span className={fieldLabelClass}>単位</span>
                      {r.unitCustom ? (
                        <div className="flex items-center gap-1">
                          <input
                            value={r.unit}
                            onChange={(e) => patchRow(r.key, { unit: e.target.value })}
                            placeholder="単位"
                            className={inputClass}
                          />
                          <button
                            type="button"
                            onClick={() => patchRow(r.key, { unitCustom: false })}
                            className="shrink-0 px-1 text-stone-400 hover:text-kent-blue-500"
                            aria-label="選択に戻す"
                          >
                            ▾
                          </button>
                        </div>
                      ) : (
                        <select
                          value={r.unit}
                          onChange={(e) => onUnitSelect(r.key, e.target.value)}
                          className={`${inputClass} select-ledger`}
                        >
                          <option value="">（なし）</option>
                          {UNITS.map((u) => (
                            <option key={u} value={u}>
                              {u}
                            </option>
                          ))}
                          {r.unit && !UNIT_SET.has(r.unit) && (
                            <option value={r.unit}>{r.unit}</option>
                          )}
                          <option value={CUSTOM_UNIT}>（直接入力…）</option>
                        </select>
                      )}
                    </div>
                    <label className="block w-24">
                      <span className={fieldLabelClass}>税率</span>
                      <select
                        value={r.taxRate}
                        onChange={(e) => patchRow(r.key, { taxRate: e.target.value })}
                        className={`${inputClass} select-ledger`}
                      >
                        {TAX_RATES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block w-28">
                      <span className={fieldLabelClass}>丸め</span>
                      <select
                        value={r.rounding}
                        onChange={(e) => patchRow(r.key, { rounding: e.target.value })}
                        className={`${inputClass} select-ledger`}
                      >
                        <option value="">既定</option>
                        {ROUNDING_MODES.map((m) => (
                          <option key={m} value={m}>
                            {ROUNDING_LABELS[m]}
                          </option>
                        ))}
                      </select>
                    </label>
                    <div className="ml-auto flex items-end gap-3">
                      <div className="text-right">
                        <span className={fieldLabelClass}>行小計</span>
                        <span className="block whitespace-nowrap font-mono text-sm tabular-nums text-stone-700 dark:text-slate-200">
                          {formatYen(rowSubtotal(r))}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => moveRow(index, -1)}
                          disabled={index === 0}
                          className="flex min-h-11 min-w-11 items-center justify-center text-stone-400 hover:text-kent-blue-500 disabled:opacity-30"
                          aria-label="上へ"
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          onClick={() => moveRow(index, 1)}
                          disabled={index === rows.length - 1}
                          className="flex min-h-11 min-w-11 items-center justify-center text-stone-400 hover:text-kent-blue-500 disabled:opacity-30"
                          aria-label="下へ"
                        >
                          ▼
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeRow(r.key)}
                        className="flex min-h-11 min-w-11 items-center justify-center px-1 text-lg text-shuiro-500 hover:text-shuiro-600 dark:text-shuiro-400"
                        aria-label="行を削除"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {rows.length === 0 && (
                <p className="py-4 text-center text-sm text-stone-400 dark:text-slate-500">
                  明細行がありません。「行を追加」で追加してください。
                </p>
              )}
            </div>
          </Card>
        </div>

        {/* 右: sticky サイドバー（ライブ合計・内訳・保存/キャンセル） */}
        <aside className="flex flex-col gap-4 lg:sticky lg:top-6">
          <Card>
            <SectionHeading>御請求額（プレビュー）</SectionHeading>
            <p className="font-display text-3xl font-bold tabular-nums text-kent-blue-600 dark:text-kent-blue-200">
              {formatYen(totals.invoiceSum)}
            </p>
            <dl className="mt-4 flex flex-col gap-2 font-mono text-sm">
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
            </dl>
          </Card>

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

          {/* メモは備考と物理的に離す（内部用を誤って請求書側に書かないように） */}
          <Card className="border-dashed">
            <SectionHeading>メモ（内部用）</SectionHeading>
            <p className="mb-2 text-xs text-stone-400 dark:text-slate-500">
              請求書・見積書には載りません。
            </p>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              rows={3}
              className={`${inputClass} resize-y`}
              aria-label="メモ（内部用）"
            />
          </Card>

          <div className="hidden items-center gap-3 lg:flex">
            <button type="submit" disabled={busy} className={primaryBtn}>
              {busy ? "保存中…" : editing ? "保存" : "作成"}
            </button>
            <button type="button" onClick={onCancel} className={subtleBtn}>
              キャンセル
            </button>
          </div>
        </aside>
      </div>

      {/* モバイル: 画面下部の固定バー（御請求額 + 保存）。lg 以上ではサイドバーが担う */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-paper-line bg-paper/95 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95 lg:hidden">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-slate-500">
              御請求額
            </p>
            <p className="truncate font-display text-xl font-bold tabular-nums text-kent-blue-600 dark:text-kent-blue-200">
              {formatYen(totals.invoiceSum)}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button type="button" onClick={onCancel} className={subtleBtn}>
              キャンセル
            </button>
            <button type="submit" disabled={busy} className={primaryBtn}>
              {busy ? "保存中…" : editing ? "保存" : "作成"}
            </button>
          </div>
        </div>
      </div>
      {/* 固定バーの高さ分の余白（モバイルのみ） */}
      <div className="h-20 lg:hidden" />
    </form>
  );
}
