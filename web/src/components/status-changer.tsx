"use client";

import { useState } from "react";
import { useRouter } from "waku/router/client";
import { INVOICE_STATUSES } from "@/lib/invoice-schema";

/**
 * 詳細画面でステータスだけを即時変更する（編集画面に入らずに切り替える）。
 * SQLite モードのときだけ表示される。変更 → POST /api/invoices/[id]/status → reload。
 * すぐ戻せる操作なので確認ダイアログは出さない。
 */
export function StatusChanger({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const onChange = async (next: string) => {
    if (next === status) {
      return;
    }
    setBusy(true);
    setError("");
    const res = await fetch(`/api/invoices/${id}/status`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status: next }),
    });
    setBusy(false);
    if (!res.ok) {
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      setError(j.error ?? "ステータスの変更に失敗しました");
      return;
    }
    router.reload();
  };

  return (
    <span className="inline-flex items-center gap-1.5">
      <label className="sr-only" htmlFor="status-changer">
        ステータスを変更
      </label>
      <select
        id="status-changer"
        value={status}
        disabled={busy}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-sm border border-paper-line bg-white/70 px-2 py-1 text-xs text-stone-600 outline-none transition hover:border-kent-blue-400 focus:border-kent-blue-500 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300 dark:focus:border-kent-blue-300"
      >
        {INVOICE_STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      {busy && <span className="text-xs text-stone-400 dark:text-slate-500">変更中…</span>}
      {error && <span className="text-xs text-shuiro-600 dark:text-shuiro-400">{error}</span>}
    </span>
  );
}
