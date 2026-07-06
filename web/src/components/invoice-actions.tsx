"use client";

import { useState } from "react";
import { Link } from "waku";
import { useRouter } from "waku/router/client";

const linkBtn =
  "rounded-sm bg-kent-blue-500 px-3 py-1.5 text-sm text-white transition hover:bg-kent-blue-600";
const subtleBtn =
  "rounded-sm border border-paper-line px-3 py-1.5 text-sm text-stone-600 transition hover:border-kent-blue-400 hover:text-kent-blue-600 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300";
const dangerBtn =
  "rounded-sm px-3 py-1.5 text-sm text-shuiro-600 transition hover:bg-shuiro-50 disabled:opacity-50 dark:text-shuiro-400 dark:hover:bg-shuiro-950/30";

/** 詳細ページの編集/複製/削除操作（SQLite モードのときだけ表示される）。 */
export function InvoiceActions({ number, id }: { number: string; id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const onDuplicate = async () => {
    setBusy(true);
    setError("");
    const res = await fetch(`/api/invoices/${id}/duplicate`, {
      method: "POST",
      credentials: "include",
    });
    setBusy(false);
    if (!res.ok) {
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      setError(j.error ?? "複製に失敗しました");
      return;
    }
    const j = (await res.json()) as { invoiceNumber?: string };
    // 複製（ドラフト）はそのまま編集画面で開く
    router.push(`/invoice/item/${j.invoiceNumber ?? number}/edit`);
  };

  const onDelete = async () => {
    if (!window.confirm(`請求書 #${number} を削除しますか？この操作は取り消せません。`)) {
      return;
    }
    setBusy(true);
    setError("");
    const res = await fetch(`/api/invoices/${id}`, { method: "DELETE", credentials: "include" });
    setBusy(false);
    if (!res.ok) {
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      setError(j.error ?? "削除に失敗しました");
      return;
    }
    router.push("/invoice/list/1");
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link to={`/invoice/item/${number}/edit`} className={linkBtn}>
        編集
      </Link>
      <button type="button" onClick={onDuplicate} disabled={busy} className={subtleBtn}>
        複製
      </button>
      <button type="button" onClick={onDelete} disabled={busy} className={dangerBtn}>
        削除
      </button>
      {error && <span className="text-sm text-shuiro-600 dark:text-shuiro-400">{error}</span>}
    </div>
  );
}
